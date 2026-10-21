create database proyecto_practicas;
use proyecto_practicas;

create table proveedores(
	id_proveedores int primary key auto_increment not null,
    nombre_proveedor varchar(50) not null,
    contacto_proveedores int not null
);

create table categoria(
	id_categoria int primary key auto_increment not null,
    nombre enum('CCTV','WLAN','PTP','control acceso') not null
);

create table marcas(
	id_marca int primary key auto_increment not null,
    nombre enum('Ubiquiti','hikvision','dahua','mikroTik')
);

create table productos(
	id_productos int primary key auto_increment not null,
    id_marca int not null,
    id_categoria int not null,
    stock int not null,
    modelo varchar(50),
    descripcion varchar(100),
    precio_lista decimal(10,5),
    moneda varchar(50),
    activo varchar(15)
);

create table reglas_margen(
	id_margen int primary key auto_increment,
    id_categoria int,
    id_marca int,
    porcentaje_margen varchar(10),
    fecha_actualizacion date
);