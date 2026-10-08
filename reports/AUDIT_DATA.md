# Datos completos de auditoria

Dos registros JSON superan el limite de archivo de GitHub. Se publican completos,
con compresion gzip sin perdida, junto con los informes y las tablas:

- `auditoria-integral-20261008/relaciones-por-actividad.json.gz`
- `microauditoria-actividades-20261008/revision-documental.json.gz`

Para restaurar los JSON despues de clonar el repositorio:

```sh
python tools/package_large_audit_data.py --unpack
```

La restauracion no sobrescribe originales existentes. Los originales locales
se conservan y cada archivo comprimido se verifica con SHA-256 antes de publicar.
Los enlaces de los informes a esos JSON funcionan una vez restaurados.
Las bases de datos y los respaldos privados no se publican.
