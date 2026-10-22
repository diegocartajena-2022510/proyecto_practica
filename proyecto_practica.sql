create database proyecto_practicas;
use proyecto_practicas;

create table proveedores(
	id_proveedores int primary key auto_increment not null,
    nombre_proveedores varchar(50) not null,
    contacto_proveedores varchar(10) not null
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
	create procedure sp_categoria_create(c_nombre enum('CCTV','WLAN','PTP','control acceso'))
    begin
		insert into categoria(nombre) values (c_nombre);
    end $$
delimiter ;

-- editar categoria 
delimiter $$
	create procedure sp_categoria_update(c_id_categoria int, c_nombre enum('CCTV','WLAN','PTP','control acceso'))
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
	create procedure sp_marcas_create(m_nombre enum('Ubiquiti','hikvision','dahua','mikroTik'))
		begin
			insert into marcas(nombre) values (m_nombre);
		end $$
delimiter ;

-- editar marcas 
delimiter $$
create procedure sp_marcas_update(m_id_marca int, m_nombre enum('Ubiquiti','hikvision','dahua','mikroTik'))
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

-- agregar productos

delimiter $$
create procedure sp_productos_create(
				p_id_marca int,
                p_id_categoria int,
                p_stock int,
                p_modelo varchar(50),
                p_descripcion varchar(100),
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
                p_descripcion varchar(100),
                p_precio_lista decimal(10,2),
                p_moneda varchar(50),
                p_activo varchar(15)
                )
	begin
		update productos
        set
			id_marca=p_id_marca,
            id_categoria=p_id_marca,
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




