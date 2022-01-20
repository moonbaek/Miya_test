create database MIYA_DB;
use MIYA_DB;
CREATE TABLE MIYA_DB.miya_user (
user_id BIGINT NOT NULL AUTO_INCREMENT,
user_username VARCHAR(45),
user_email VARCHAR(45),
user_password VARCHAR(85),
json_data JSON,
PRIMARY KEY (user_id));

DELIMITER $$
CREATE DEFINER=`miya`@`localhost` PROCEDURE `sp_createUser`(
IN p_username VARCHAR(20),
IN p_email VARCHAR(20),
IN p_password VARCHAR(85)
)
BEGIN
IF ( select exists (select 1 from miya_user where user_username = p_username) ) THEN
select 'Username Exists !!';
ELSE
insert into miya_user
(
user_username,
user_email,
user_password
)
values
(
p_username,
p_email,
p_password
);
END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`miya`@`localhost` PROCEDURE `sp_validateLogin`(
IN p_username VARCHAR(20)
)
BEGIN
select * from miya_user where user_username = p_username;
END$$
DELIMITER ;

CREATE TABLE MIYA_DB.miya_item (
obj_id BIGINT NOT NULL AUTO_INCREMENT,
obj_name VARCHAR(255),
obj_category VARCHAR(45),
obj_location VARCHAR(90),
obj_timestamp VARCHAR(45),
obj_filepath VARCHAR(255),
obj_json TEXT,
PRIMARY KEY (obj_id));

show tables;
desc miya_user;
desc miya_item;
show PROCEDURE STATUS WHERE db = 'MIYA_DB';

