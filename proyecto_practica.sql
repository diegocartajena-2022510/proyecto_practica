create database proyecto_practicas;
use proyecto_practicas;

create table usuario(
	id_usuario int primary key auto_increment not null,
    nombre varchar(50),
    correo varchar(50) unique not null,
    pasword varchar(50),
    telefono varchar(20),
    fecha_creacion date
);

create table proveedores(
	id_proveedores int primary key auto_increment not null,
    nombre_proveedores varchar(50) not null,
    contacto_proveedores varchar(10) not null
);

create table categoria(
	id_categoria int primary key auto_increment not null,
    nombre varchar(50) not null
);

create table marcas(
	id_marca int primary key auto_increment not null,
    nombre varchar(50) not null
);

create table productos(
	id_productos int primary key auto_increment not null,
    id_marca int not null,
    id_categoria int not null,
    stock int not null,
    modelo varchar(50),
    descripcion varchar(255),
    precio_lista decimal(10,2),
    moneda varchar(50),
    activo varchar(15),
    constraint fk_id_marca foreign key (id_marca) references marcas(id_marca) on delete cascade,
    constraint fk_id_categoria foreign key (id_categoria) references categoria(id_categoria) on delete cascade
);

create table reglas_margen(
	id_margen int primary key auto_increment,
    id_categoria int,
    id_marca int,
    porcentaje_margen varchar(10),
    fecha_actualizacion date,
    constraint id_categoria_fk foreign key (id_categoria) references categoria(id_categoria) on delete cascade,
    constraint id_marca_fk foreign key (id_marca) references marcas(id_marca) on delete cascade
);

-- PROCEDIMIENTOS ALMACENADOS DE PROVEEDORES --

-- listar proveedores
delimiter $$
	create procedure sp_proveedores_read()
    begin
		select * from proveedores;
	end$$
delimiter ;

-- agregar proveedores
delimiter $$
	create procedure sp_proveedores_create(
		p_nombre_proveedores varchar(50),
        p_contacto_proveedores varchar(10)
        )
        begin
			insert into proveedores(nombre_proveedores,contacto_proveedores) values
			(p_nombre_proveedores, p_contacto_proveedores);
        end$$
delimiter ;

-- actualizar proveedores
delimiter $$
	create procedure sp_proveedores_update(
		p_id_proveedores int,
        p_nombre_proveedores varchar(50),
        p_contacto_proveedores varchar(10)
    )
    begin
		update proveedores
        set
			nombre_proveedores= p_nombre_proveedores,
			contacto_proveedores=p_contacto_proveedores
        where id_proveedores=p_id_proveedores;
	end$$
delimiter ;

-- eliminar proveedres
delimiter $$
	create procedure sp_proveedores_delete(p_id_proveedres int)
    begin
		delete from proveedores where id_proveedores=p_id_proveedres;
	end$$
delimiter ;

-- PROCEDIMIENTOS ALMACENADOS DE CATEGORIAS --

-- listar categoria
delimiter $$
	create procedure sp_categria_read()
    begin
		select * from categoria;
    end $$
delimiter ;

-- agregar categoria

delimiter $$
	create procedure sp_categoria_create(c_nombre varchar(50))
    begin
		insert into categoria(nombre) values (c_nombre);
    end $$
delimiter ;

-- editar categoria 
delimiter $$
	create procedure sp_categoria_update(c_id_categoria int, c_nombre varchar(50))
    begin
		update categoria
        set
        nombre=c_nombre
        where id_categoria=c_id_categoria;
    end $$
delimiter ;

-- eliminar categoria 
delimiter $$
	create procedure sp_categoria_delete(c_id_categoria int)
    begin
		delete from categoria where id_categoria=c_id_categoria;
    end $$
delimiter ;

-- PROCEDIMIENTOS ALMACENADOS DE MARCAS --

-- listar marcas
delimiter $$
	create procedure sp_marcas_read()
    begin
		select * from marcas;
	end $$
delimiter ;

-- agregar marcas
delimiter $$
	create procedure sp_marcas_create(m_nombre varchar(50))
		begin
			insert into marcas(nombre) values (m_nombre);
		end $$
delimiter ;

-- editar marcas 
delimiter $$
create procedure sp_marcas_update(m_id_marca int, m_nombre varchar(50))
    begin
		update marcas
        set
        nombre=m_nombre
        where id_marca= m_id_marca;
    end $$
delimiter ;

-- eliminar marcas
delimiter $$
create procedure sp_marcas_delete(m_id_marca int)
	begin
		delete from marcas where id_marca=m_id_marca;
	end $$
delimiter ;

-- PROCEDIMIENTOS ALMACENADOS DE PRODUCTOS

-- listar productos 
delimiter $$
create procedure sp_productos_read()
	begin
		select * from productos;
	end $$
delimiter ;

-- buscar productos por modelo, descripcion, marca o categoria
delimiter $$
create procedure sp_productos_buscar(in p_busqueda varchar(100))
begin
    if p_busqueda is null or trim(p_busqueda) = '' then
        select
            p.id_productos,
            p.id_marca,
            m.nombre as marca,
            p.id_categoria,
            c.nombre as categoria,
            p.stock,
            p.modelo,
            p.descripcion,
            p.precio_lista,
            p.moneda,
            p.activo
        from productos p
        left join marcas m on m.id_marca = p.id_marca
        left join categoria c on c.id_categoria = p.id_categoria
        order by p.modelo;
    else
        select
            p.id_productos,
            p.id_marca,
            m.nombre as marca,
            p.id_categoria,
            c.nombre as categoria,
            p.stock,
            p.modelo,
            p.descripcion,
            p.precio_lista,
            p.moneda,
            p.activo
        from productos p
        left join marcas m on m.id_marca = p.id_marca
        left join categoria c on c.id_categoria = p.id_categoria
        where lower(p.modelo) like concat('%', lower(trim(p_busqueda)), '%')
           or lower(p.descripcion) like concat('%', lower(trim(p_busqueda)), '%')
           or lower(m.nombre) like concat('%', lower(trim(p_busqueda)), '%')
           or lower(c.nombre) like concat('%', lower(trim(p_busqueda)), '%')
        order by p.modelo;
    end if;
end $$
delimiter ;

-- agregar productos

delimiter $$
create procedure sp_productos_create(
				p_id_marca int,
                p_id_categoria int,
                p_stock int,
                p_modelo varchar(50),
                p_descripcion varchar(255),
                p_precio_lista decimal(10,2),
                p_moneda varchar(50),
                p_activo varchar(15)
				)
	begin
		insert into productos(id_marca,id_categoria,stock,modelo,descripcion,precio_lista,moneda,activo) 
			values (p_id_marca,p_id_categoria,p_stock,p_modelo,p_descripcion, p_precio_lista,p_moneda,p_activo);
    end $$
delimiter ;

delimiter $$
create procedure sp_productos_update(
				p_id_productos int,
                p_id_marca int,
                p_id_categoria int,
                p_stock int,
                p_modelo varchar(50),
                p_descripcion varchar(255),
                p_precio_lista decimal(10,2),
                p_moneda varchar(50),
                p_activo varchar(15)
                )
	begin
		update productos
        set
			id_marca=p_id_marca,
            id_categoria=p_id_categoria,
            stock=p_stock,
            modelo=p_modelo,
            descripcion=p_descripcion,
            precio_lista=p_precio_lista,
            moneda=p_moneda,
            activo=p_activo
		where id_productos=p_id_productos;
	end $$
delimiter ;

delimiter $$
	create procedure sp_productos_delete(p_id_productos int)
    begin
		delete from productos where id_productos=p_id_productos;
    end$$
delimiter ;


-- PROCEDIMIENTOS ALMACENADOS DE REGLAS MARGEN--

-- listar reglas margen
delimiter $$
	create procedure sp_reglas_margen_read()
    begin
		select * from reglas_margen;
    end $$
delimiter ;

-- agregar reglas margen
delimiter $$
	create procedure sp_reglas_margen_create( r_id_categoria int,
                                                r_id_marca int,
                                                r_porcentaje_margen varchar(50),
                                                r_fecha_actualizacion date
                                                )
	begin 
		insert into reglas_margen(id_categoria,id_marca,porcentaje_margen,fecha_actualizacion)
			values (r_id_categoria,r_id_marca,r_porcentaje_margen,r_fecha_actualizacion);
    end $$
delimiter ;

-- actualizar reglas margen
delimiter $$
	create procedure sp_reglas_margen_update( r_id_margen int,
												r_id_categoria int,
                                                r_id_marca int,
                                                r_porcentaje_margen varchar(50),
                                                r_fecha_actualizacion date
                                                )
	begin
    update reglas_margen
		set 
			id_categoria=r_id_categoria,
			id_marca=r_id_marca,
			porcentaje_margen=r_porcentaje_margen,
			fecha_actualizacion=r_fecha_actualizacion
		where id_margen=r_id_margen;
    end $$
delimiter ;

-- eliminar reglas margen
delimiter $$
	create procedure sp_reglas_margen_delete(r_id_margen int)
    begin
		delete from reglas_margen where id_margen=r_id_margen;
    end $$
delimiter ;

-- USUARIOS --


delimiter $$
	create procedure sp_usuarios_create(u_nombre varchar(50),u_correo varchar(50),u_pasword varchar(50), u_telefono int)
    begin
		insert into usuario(nombre,correo,pasword,telefono,fecha_creacion) values (u_nombre,u_correo,u_pasword,u_telefono,curdate());
    end $$
delimiter ;


DELIMITER $$
CREATE PROCEDURE sp_usuarios_login(
    IN u_correo VARCHAR(50),
    IN u_pasword VARCHAR(50)
)
BEGIN
    SELECT id_usuario, nombre, correo, telefono,fecha_creacion
    FROM usuario 
    WHERE correo = u_correo AND pasword = u_pasword;
END $$sp_usuarios_login
DELIMITER ;

delimiter $$
create procedure sp_usuarios_delete ( u_id_usuario int)
begin
	delete from usuario where u_id_usuario=id_usuario;
end $$
delimiter ;

DELIMITER $$
CREATE PROCEDURE sp_usuarios_update(
    IN u_id_usuario INT, 
    IN u_nombre VARCHAR(50), 
    IN u_correo VARCHAR(50), 
    IN u_pasword VARCHAR(50),
    IN u_telefono varchar(20)
)
BEGIN
    UPDATE usuario
    SET nombre = u_nombre,
        correo = u_correo,
        pasword = u_pasword,
        telefono = u_telefono
    WHERE id_usuario = u_id_usuario;
END $$
DELIMITER ;

SELECT 
  p.id_productos, 
  p.modelo, 
  p.descripcion, 
  p.precio_lista, 
  p.moneda, 
  p.activo,
  c.nombre AS categoria_nombre 
FROM productos p
JOIN categoria c ON p.id_categoria = c.id_categoria;

-- REGISTROS DE PRUEBA USANDO PROCEDIMIENTOS ALMACENADOS --
-- 10 registros por entidad

CALL sp_proveedores_create('TechNet', '5551234');
CALL sp_proveedores_create('RedLink', '5554321');
CALL sp_proveedores_create('NexaCom', '5553456');
CALL sp_proveedores_create('OptiFlow', '5558765');
CALL sp_proveedores_create('MetroData', '5551122');
CALL sp_proveedores_create('SegurMax', '5553344');
CALL sp_proveedores_create('NetVision', '5557788');
CALL sp_proveedores_create('SkyInfra', '5559900');
CALL sp_proveedores_create('CablePro', '5552233');
CALL sp_proveedores_create('LinkPlus', '5554455');

CALL sp_categoria_create('LAN');
CALL sp_categoria_create('WLAN');
CALL sp_categoria_create('PTP');
CALL sp_categoria_create('PTMP');
CALL sp_categoria_create('CCTV');
CALL sp_categoria_create('control de acceso');

CALL sp_marcas_create('Ubiquiti');
CALL sp_marcas_create('Ubiquiti');
CALL sp_marcas_create('Ubiquiti');
CALL sp_marcas_create('hikvision');
CALL sp_marcas_create('hikvision');
CALL sp_marcas_create('hikvision');
CALL sp_marcas_create('dahua');
CALL sp_marcas_create('dahua');
CALL sp_marcas_create('mikroTik');
CALL sp_marcas_create('mikroTik');

CALL sp_productos_create(1, 1, 25, 'UAC-AP-Pro', 'Access point profesional con doble banda 2.4/5 GHz, 802.11ac Wave 2, antenas internas y administración centralizada para redes empresariales.', 699.00, 'Q', 'Activo');
CALL sp_productos_create(1, 2, 18, 'UAP-AC-LR', 'Access point de interior con cobertura extendida, MU-MIMO, mejor rendimiento para entornos con varios usuarios y fácil integración con controladores de red.', 540.00, 'Q', 'Activo');
CALL sp_productos_create(2, 5, 12, 'DS-2CD2142G0', 'Cámara IP 4MP con sensor CMOS, visión nocturna, detección de movimiento y transmisión de video en alta definición para vigilancia exterior.', 899.99, 'Q', 'Activo');
CALL sp_productos_create(2, 5, 20, 'DS-2CE72DF3T', 'Cámara analógica inteligente con resolución HD, reducción de ruido, lente ajustable y diseño compacto para uso residencial y comercial.', 650.00, 'Q', 'Activo');
CALL sp_productos_create(3, 3, 8, 'PTO-Bridge 5G', 'Punto a punto 5G de alto rendimiento para enlaces de larga distancia con baja latencia, estabilidad y conectividad segura para respaldo de red.', 1500.00, 'Q', 'Activo');
CALL sp_productos_create(3, 3, 14, 'PTO-Bridge 60G', 'Punto a punto 60G de alta capacidad para transmisión robusta de datos, ideal para conectividad entre sedes y enlaces inalámbricos de fibra.', 1700.00, 'Q', 'Activo');
CALL sp_productos_create(4, 1, 30, 'CCR1009-7G-1C', 'Router de borde con 7 puertos Gigabit, alta capacidad de enrutamiento y conectividad estable para infraestructura de red crítica.', 220.00, 'Q', 'Activo');
CALL sp_productos_create(4, 1, 11, 'RB5009UG+', 'Switch compacto con puertos PoE y manejo eficiente del tráfico, ideal para desplegar cámaras y equipos de red en espacios reducidos.', 185.00, 'Q', 'Activo');
CALL sp_productos_create(1, 4, 9, 'NanoBeam 5AC', 'Enlace inalámbrico de alta ganancia diseñado para conexiones punto a punto con estabilidad, baja latencia y excelente rendimiento en ambientes con interferencia moderada.', 120.00, 'Q', 'Activo');
CALL sp_productos_create(2, 5, 16, 'TC-NVR-8P', 'Grabador de video NVR con soporte para múltiples cámaras, almacenamiento local, gestión centralizada y monitoreo continuo 24/7 para seguridad integral.', 740.00, 'Q', 'Activo');

CALL sp_productos_create(1, 2, 14, 'UAP-AC-M', 'Access point de interior con tecnología Wi-Fi 5, cobertura equilibrada y administración sencilla para pequeñas oficinas y puntos de acceso de trabajo.', 420.00, 'Q', 'Activo');
CALL sp_productos_create(3, 5, 11, 'DS-2CD2043G2', 'Cámara IP 4MP con lente fijo, detección inteligente, visión nocturna y diseño robusto para monitoreo exterior de alta confiabilidad.', 980.00, 'Q', 'Activo');
CALL sp_productos_create(4, 1, 22, 'RouterBoard hAP ac²', 'Router inalámbrico de alto rendimiento con dual-band, soporte para redes empresariales y conectividad estable para ambientes con múltiples usuarios.', 310.00, 'Q', 'Activo');
CALL sp_productos_create(2, 5, 7, 'DVR-216', 'Grabador digital con capacidad para 16 canales, soporte para almacenamiento avanzado y control centralizado de cámaras CCTV.', 860.00, 'Q', 'Activo');
CALL sp_productos_create(3, 4, 9, 'MikroTik SXTsq', 'Dispositivo inalámbrico de exterior para enlaces punto a punto con diseño resistente y excelente rendimiento en condiciones climáticas exigentes.', 195.00, 'Q', 'Activo');
CALL sp_productos_create(1, 4, 26, 'PowerBeam 5AC', 'Antena de alta ganancia para enlaces inalámbricos con estabilidad, conexión de largo alcance y excelente relación costo-beneficio.', 260.00, 'Q', 'Activo');
CALL sp_productos_create(4, 1, 17, 'CRS326-24G-2S+', 'Switch gestionable con puertos Gigabit y alta capacidad de conmutación para redes de tráfico mediano y entornos corporativos.', 470.00, 'Q', 'Activo');
CALL sp_productos_create(2, 5, 15, 'TC-IPC-3K', 'Cámara de seguridad con resolución 3K, alta sensibilidad y diseño compacto para monitoreo continuo en edificios y tiendas.', 610.00, 'Q', 'Activo');
CALL sp_productos_create(3, 3, 10, 'P2P-Bridge 10G', 'Enlace de fibra inalámbrica con capacidad alta para conexión entre sedes, buena latencia y estabilidad para tráfico de datos crítico.', 1320.00, 'Q', 'Activo');
CALL sp_productos_create(1, 2, 19, 'UAP-AC-Lite', 'Access point compacto y eficiente para despliegues ligeros con excelente cobertura y administración centralizada en redes pequeñas.', 480.00, 'Q', 'Activo');

CALL sp_productos_create(1, 1, 40, 'LAN-Switch-24G', 'Switch gestionable de 24 puertos Gigabit con alta capacidad de conmutación para redes corporativas y backbone interno.', 320.00, 'Q', 'Activo');
CALL sp_productos_create(2, 1, 35, 'LAN-Router-Edge', 'Router empresarial con capacidad de enrutamiento robusto para tráfico interno y conectividad estable entre sedes.', 410.00, 'Q', 'Activo');
CALL sp_productos_create(3, 1, 28, 'LAN-Access-8P', 'Access point PoE de alta densidad para entornos con múltiples dispositivos conectados a la misma red.', 360.00, 'Q', 'Activo');
CALL sp_productos_create(4, 1, 22, 'LAN-POE-16', 'Distribuidor PoE para alimentación centralizada de cámaras, telefonía y equipos de red dentro de la infraestructura.', 280.00, 'Q', 'Activo');
CALL sp_productos_create(1, 1, 18, 'LAN-Mini-Switch', 'Switch compacto para despliegues pequeños con puertos Gigabit y administración sencilla para oficinas.', 210.00, 'Q', 'Activo');

CALL sp_productos_create(1, 2, 24, 'WLAN-AP-Indoor', 'Access point de interior de alta velocidad con cobertura uniforme para oficinas y espacios de trabajo.', 520.00, 'Q', 'Activo');
CALL sp_productos_create(2, 2, 20, 'WLAN-AP-Outdoor', 'Access point exterior resistente con cobertura amplia y excelente rendimiento para patios y accesos.', 690.00, 'Q', 'Activo');
CALL sp_productos_create(3, 2, 16, 'WLAN-Bridge-AC', 'Bridge inalámbrico de alta potencia para enlaces Wi-Fi con estabilidad y baja latencia en entornos densos.', 390.00, 'Q', 'Activo');
CALL sp_productos_create(4, 2, 14, 'WLAN-Client-5G', 'Cliente inalámbrico 5G para conexiones de alta velocidad en redes distribuidas y campus.', 430.00, 'Q', 'Activo');
CALL sp_productos_create(1, 2, 18, 'WLAN-CPE-High', 'CPE de alto rendimiento para conexión inalámbrica de largo alcance con cobertura estable y fácil administración.', 570.00, 'Q', 'Activo');

CALL sp_productos_create(1, 3, 12, 'PTP-Link-10G', 'Enlace punto a punto de 10G para conexiones rápidas entre edificios y nodos críticos de la red.', 1500.00, 'Q', 'Activo');
CALL sp_productos_create(2, 3, 9, 'PTP-Bridge-60G', 'Puente punto a punto de 60G pensado para enlaces de alta capacidad con máxima estabilidad.', 1700.00, 'Q', 'Activo');
CALL sp_productos_create(3, 3, 11, 'PTP-LongRange', 'Equipo punto a punto de largo alcance para cubrir distancias extensas con mínima pérdida de señal.', 1280.00, 'Q', 'Activo');
CALL sp_productos_create(4, 3, 10, 'PTP-Tower-5G', 'Solución de torre para enlaces de alta velocidad con conectividad robusta y baja latencia.', 1425.00, 'Q', 'Activo');
CALL sp_productos_create(1, 3, 13, 'PTP-Fiber-40G', 'Enlace punto a punto con capacidad 40G para transferencia de datos intensiva y respaldo de red.', 1600.00, 'Q', 'Activo');

CALL sp_productos_create(2, 4, 15, 'PTMP-Base-5G', 'Estación base punto multipunto para conectar múltiples clientes con alta capacidad y rendimientos estables.', 920.00, 'Q', 'Activo');
CALL sp_productos_create(3, 4, 18, 'PTMP-Client-2', 'Cliente multipunto con diseño compacto para integración en redes Wi-Fi distribuidas y cobertura extendida.', 470.00, 'Q', 'Activo');
CALL sp_productos_create(4, 4, 12, 'PTMP-Backhaul', 'Equipo de backhaul para tráfico intenso entre nodos remotos en redes de telecomunicaciones.', 880.00, 'Q', 'Activo');
CALL sp_productos_create(1, 4, 17, 'PTMP-Outdoor-AC', 'Equipo multipunto exterior con alta ganancia y resistencia para entornos con interferencia moderada.', 540.00, 'Q', 'Activo');
CALL sp_productos_create(2, 4, 14, 'PTMP-Access-Plus', 'Solución multipunto avanzada para acceso masivo con alta estabilidad y fácil administración.', 610.00, 'Q', 'Activo');

CALL sp_productos_create(1, 5, 30, 'CCTV-4MP-IR', 'Cámara IP 4MP con visión nocturna, detección de movimiento y diseño resistente para vigilancia exterior.', 780.00, 'Q', 'Activo');
CALL sp_productos_create(2, 5, 26, 'CCTV-8MP-Turret', 'Cámara turretera 8MP con lente preciso, gran capacidad de detalles y monitoreo continuo.', 990.00, 'Q', 'Activo');
CALL sp_productos_create(3, 5, 20, 'CCTV-NVR-16', 'Grabador NVR con capacidad para 16 canales y almacenamiento eficiente para seguridad total.', 860.00, 'Q', 'Activo');
CALL sp_productos_create(4, 5, 18, 'CCTV-DVR-8', 'DVR compacto para monitoreo continuo con variedad de canales para instalaciones pequeñas y medianas.', 720.00, 'Q', 'Activo');
CALL sp_productos_create(1, 5, 14, 'CCTV-Fisheye-360', 'Cámara omnidireccional 360 con cobertura total para monitoreo de áreas amplias sin puntos ciegos.', 1040.00, 'Q', 'Activo');

CALL sp_productos_create(1, 6, 25, 'AC-Reader-Pro', 'Lector de acceso profesional para control seguro de ingresos en edificios, oficinas y zonas restringidas.', 180.00, 'Q', 'Activo');
CALL sp_productos_create(2, 6, 22, 'AC-Panel-32', 'Panel de control con capacidad para múltiples accesos, alarmas y gestión centralizada.', 430.00, 'Q', 'Activo');
CALL sp_productos_create(3, 6, 19, 'AC-Controller-8', 'Controlador de acceso para 8 puertas con alta seguridad y administración eficiente.', 520.00, 'Q', 'Activo');
CALL sp_productos_create(4, 6, 20, 'AC-Door-Exit', 'Equipo de salida para gestión de puertas y monitoreo de accesos autorizados.', 210.00, 'Q', 'Activo');
CALL sp_productos_create(1, 6, 18, 'AC-Alarm-Reader', 'Dispositivo integrado con sensor de alarma y lector para reforzar la seguridad de accesos críticos.', 260.00, 'Q', 'Activo');

CALL sp_reglas_margen_create(1, 1, '25%', CURDATE());
CALL sp_reglas_margen_create(1, 2, '28%', CURDATE());
CALL sp_reglas_margen_create(2, 2, '30%', CURDATE());
CALL sp_reglas_margen_create(2, 3, '22%', CURDATE());
CALL sp_reglas_margen_create(3, 3, '20%', CURDATE());
CALL sp_reglas_margen_create(3, 4, '24%', CURDATE());
CALL sp_reglas_margen_create(4, 1, '26%', CURDATE());
CALL sp_reglas_margen_create(4, 4, '18%', CURDATE());
CALL sp_reglas_margen_create(1, 3, '27%', CURDATE());
CALL sp_reglas_margen_create(2, 4, '29%', CURDATE());

CALL sp_usuarios_create('', 'carlos@empresa.com', '123456',curdate());
CALL sp_usuarios_create('Ana Pérez', 'ana@empresa.com', 'admin123',curdate());
CALL sp_usuarios_create('Luis Gómez', 'luis@empresa.com', 'pass123',curdate());
CALL sp_usuarios_create('María Ruiz', 'maria@empresa.com', 'segura456',curdate());
CALL sp_usuarios_create('José Torres', 'jose@empresa.com', 'jose2024',curdate());
CALL sp_usuarios_create('Sofía Castro', 'sofia@empresa.com', 'sofia789',curdate());
CALL sp_usuarios_create('Pedro Díaz', 'pedro@empresa.com', 'pedro321',curdate());
CALL sp_usuarios_create('Valeria Mora', 'valeria@empresa.com', 'valeria123',curdate());
CALL sp_usuarios_create('Andrés Silva', 'andres@empresa.com', 'andres456',curdate());
CALL sp_usuarios_create('Laura Ramos', 'laura@empresa.com', 'laura987',curdate());


ALTER TABLE usuario MODIFY COLUMN fecha_creacion DATE DEFAULT (CURRENT_DATE);