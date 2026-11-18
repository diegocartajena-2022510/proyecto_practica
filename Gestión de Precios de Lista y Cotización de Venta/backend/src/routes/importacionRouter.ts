import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import db from '../config/db';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/importar-productos', upload.single('archivo'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      return res.status(400).json({ error: 'El archivo está vacío o tiene un formato incorrecto' });
    }

    let count = 0;
    for (const row of sheetData) {
      const { modelo, descripcion, precio_lista, id_categoria, id_marca } = row;
      
      if (modelo && precio_lista) {
        const query = `
          INSERT INTO productos (modelo, descripcion, precio_lista, id_categoria, id_marca, stock, moneda, activo)
          VALUES (?, ?, ?, ?, ?, 10, 'USD', '1')
        `;
        await db.query(query, [modelo, descripcion || '', precio_lista, id_categoria || 1, id_marca || 1]);
        count++;
      }
    }

    res.json({ message: `Se han importado ${count} productos exitosamente.` });
  } catch (err: any) {
    console.error('Error al importar archivo:', err);
    res.status(500).json({ error: 'Error procesando el archivo: ' + err.message });
  }
});
export default router;