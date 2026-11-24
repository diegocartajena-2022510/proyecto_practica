import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import db from '../config/db';

const router = Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const originalName = (file.originalname || '').toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => originalName.endsWith(ext));
    if (!hasValidExt) {
      return cb(new Error('Solo se permiten archivos .xlsx, .xls o .csv'));
    }
    cb(null, true);
  }
});

function handleUpload(req: any, res: any, next: any) {
  upload.single('archivo')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El archivo supera el tamaño máximo permitido de 5 MB' });
      }
      return res.status(400).json({ error: err.message || 'Archivo no válido' });
    }
    next();
  });
}

function normalizeRowKeys(row: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(row || {})) {
    const cleanKey = String(key || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
    normalized[cleanKey] = value;
  }
  return normalized;
}

function parseCleanNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const str = String(value)
    .trim()
    .replace(/[$Qq]|GTQ|USD/gi, '')
    .replace(/,/g, '')
    .trim();
  if (!str) return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

function isRowCompletelyEmpty(row: Record<string, any>): boolean {
  return Object.values(row).every(
    (val) => val === null || val === undefined || String(val).trim() === ''
  );
}

router.post('/importar-productos', handleUpload, async (req: any, res) => {
  try {
    if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo o el archivo está vacío' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ error: 'El archivo no contiene hojas válidas' });
    }

    const sheetName = workbook.SheetNames[0];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: ''
    });

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      return res.status(400).json({ error: 'El archivo está vacío o no tiene filas con datos' });
    }

    let importados = 0;
    let omitidos = 0;
    const errores: { fila: number; motivo: string }[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const filaNumero = i + 2;
      const row = normalizeRowKeys(rawRows[i]);

      if (isRowCompletelyEmpty(row)) {
        continue;
      }

      const modelo = String(row.modelo ?? row.nombre ?? '').trim();
      const descripcion = String(row.descripcion ?? '').trim();
      const precioLista = parseCleanNumber(row.precio_lista ?? row.precio);
      const stockRaw = row.stock === '' || row.stock === undefined ? 10 : parseCleanNumber(row.stock);
      const idCategoriaRaw = row.id_categoria === '' || row.id_categoria === undefined ? 1 : parseCleanNumber(row.id_categoria);
      const idMarcaRaw = row.id_marca === '' || row.id_marca === undefined ? 1 : parseCleanNumber(row.id_marca);

      const monedaRaw = String(row.moneda ?? 'USD').trim().toUpperCase();
      const moneda = monedaRaw === 'Q' || monedaRaw === 'GTQ' ? 'Q' : 'USD';

      if (!modelo) {
        omitidos++;
        errores.push({ fila: filaNumero, motivo: 'Falta el modelo o nombre del producto' });
        continue;
      }

      if (/^\d+(\.\d+)?$/.test(modelo)) {
        omitidos++;
        errores.push({ fila: filaNumero, motivo: 'El modelo no puede ser únicamente un número' });
        continue;
      }

      if (precioLista === null || precioLista <= 0) {
        omitidos++;
        errores.push({ fila: filaNumero, motivo: 'Precio de lista inválido o menor/igual a 0' });
        continue;
      }

      if (stockRaw === null || !Number.isInteger(stockRaw) || stockRaw < 0) {
        omitidos++;
        errores.push({ fila: filaNumero, motivo: 'El stock debe ser un número entero mayor o igual a 0' });
        continue;
      }

      if (idCategoriaRaw === null || !Number.isInteger(idCategoriaRaw) || idCategoriaRaw <= 0) {
        omitidos++;
        errores.push({ fila: filaNumero, motivo: 'id_categoria no válido' });
        continue;
      }

      if (idMarcaRaw === null || !Number.isInteger(idMarcaRaw) || idMarcaRaw <= 0) {
        omitidos++;
        errores.push({ fila: filaNumero, motivo: 'id_marca no válido' });
        continue;
      }

      const query = `
        INSERT INTO productos (modelo, descripcion, precio_lista, id_categoria, id_marca, stock, moneda, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, '1')
      `;
      await db.query(query, [
        modelo,
        descripcion,
        precioLista,
        idCategoriaRaw,
        idMarcaRaw,
        stockRaw,
        moneda
      ]);
      importados++;
    }

    if (importados === 0 && errores.length > 0) {
      return res.status(400).json({
        error: 'No se importó ningún producto. Revisa los errores por fila.',
        importados,
        omitidos,
        errores: errores.slice(0, 10)
      });
    }

    const resumenErrores =
      errores.length > 0 ? ` (${omitidos} fila(s) omitida(s) por datos inválidos)` : '';

    res.json({
      message: `Se han importado ${importados} producto(s) exitosamente${resumenErrores}.`,
      importados,
      omitidos,
      errores: errores.slice(0, 10)
    });
  } catch (err: any) {
    console.error('Error al importar archivo:', err);
    res.status(500).json({ error: 'Error procesando el archivo: ' + err.message });
  }
});

export default router;