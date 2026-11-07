import os
import re

import pymysql

DEFAULT_DSN = "root:@tcp(127.0.0.1:3306)/guardian_vision?parseTime=true&charset=utf8mb4&loc=Local"
MYSQL_DSN = re.compile(
    r"^(?P<user>[^:@/]+)(?::(?P<password>[^@]*))?@tcp"
    r"\((?P<host>[^):]+)(?::(?P<port>\d+))?\)/(?P<database>[^?]+)(?:\?(?P<query>.*))?$"
)


def parse_mysql_dsn(dsn):
    match = MYSQL_DSN.fullmatch(dsn.strip())
    if not match:
        raise ValueError(
            "GV_DB_DSN must use the Go MySQL driver format: user:password@tcp(host:port)/database"
        )
    values = match.groupdict()
    return {
        "host": values["host"],
        "port": int(values["port"] or 3306),
        "user": values["user"],
        "password": values["password"] or "",
        "database": values["database"],
        "charset": "utf8mb4",
        "cursorclass": pymysql.cursors.DictCursor,
        "autocommit": False,
        "connect_timeout": 5,
        "read_timeout": 30,
        "write_timeout": 30,
        "use_unicode": True,
        "sql_mode": "STRICT_TRANS_TABLES",
        "init_command": "SET NAMES utf8mb4",
    }


def connect_database():
    dsn = os.environ.get("GV_DB_DSN", DEFAULT_DSN)
    return pymysql.connect(**parse_mysql_dsn(dsn))


def excel_text(value):
    if value is None:
        return ""
    return str(value).strip()
