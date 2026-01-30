# 🚀 Guía de Deploy - PuntoTecno

Esta guía te ayudará a desplegar PuntoTecno con **Backend en PythonAnywhere** y **Frontend en Vercel**.

## 📋 Tabla de Contenidos
- [Preparación](#preparación)
- [Deploy Backend (PythonAnywhere)](#deploy-backend-pythonanywhere)
- [Deploy Frontend (Vercel)](#deploy-frontend-vercel)
- [Configuración Post-Deploy](#configuración-post-deploy)

---

## 🔧 Preparación

### 1. Limpiar Base de Datos

Antes de desplegar, eliminá todos los datos de prueba:

```bash
cd backend
python manage.py clean_test_data --confirm
```

Este comando eliminará:
- ✅ Todas las ventas y sus items
- ✅ Todas las órdenes de reparación
- ✅ Todos los productos
- ✅ Categorías de prueba
- ✅ Todos los clientes
- ✅ Usuarios de prueba (mantiene solo el admin)

### 2. Crear Usuario Administrador

Si limpiaste la base de datos, creá un nuevo admin:

```bash
python manage.py createsuperuser
```

---

## 🐍 Deploy Backend (PythonAnywhere)

### Paso 1: Crear Cuenta
1. Registrate en [PythonAnywhere](https://www.pythonanywhere.com/)
2. Elegí el plan gratuito (suficiente para empezar)

### Paso 2: Subir el Código

#### Opción A: Via Git (Recomendado)
```bash
# En PythonAnywhere Console
git clone https://github.com/NicolasGomez268/PuntoTecno.git
cd PuntoTecno/backend
```

#### Opción B: Subir Archivos
Usá el panel "Files" de PythonAnywhere para subir la carpeta `backend`.

### Paso 3: Configurar Entorno Virtual

```bash
# Crear virtualenv con Python 3.10
mkvirtualenv --python=/usr/bin/python3.10 puntotecno-env

# Activar entorno
workon puntotecno-env

# Instalar dependencias
pip install -r requirements.txt
```

### Paso 4: Configurar Variables de Entorno

En PythonAnywhere, creá un archivo `.env` o configurá variables en el panel:

```bash
# /home/TU_USUARIO/PuntoTecno/backend/.env
DEBUG=False
SECRET_KEY=tu-clave-secreta-super-segura-cambiala
ALLOWED_HOSTS=tu-usuario.pythonanywhere.com
CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app
```

### Paso 5: Configurar Web App

1. Ir a pestaña **Web** en PythonAnywhere
2. Click en **Add a new web app**
3. Elegir **Manual configuration** (no Django)
4. Python version: **3.10**

### Paso 6: Configurar WSGI

Editá el archivo WSGI (`/var/www/tu_usuario_pythonanywhere_com_wsgi.py`):

```python
import os
import sys

# Agregar tu proyecto al path
path = '/home/TU_USUARIO/PuntoTecno/backend'
if path not in sys.path:
    sys.path.append(path)

# Configurar Django settings
os.environ['DJANGO_SETTINGS_MODULE'] = 'puntotecno.settings'

# Activar virtualenv
activate_this = '/home/TU_USUARIO/.virtualenvs/puntotecno-env/bin/activate_this.py'
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

# Importar aplicación Django
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### Paso 7: Configurar Archivos Estáticos

En pestaña **Web**, sección **Static files**:

| URL | Directory |
|-----|-----------|
| `/static/` | `/home/TU_USUARIO/PuntoTecno/backend/staticfiles` |
| `/media/` | `/home/TU_USUARIO/PuntoTecno/backend/media` |

### Paso 8: Ejecutar Migraciones

```bash
cd ~/PuntoTecno/backend
python manage.py migrate
python manage.py collectstatic --noinput
```

### Paso 9: Recargar Web App

Click en el botón verde **Reload** en la pestaña Web.

Tu API ahora está en: `https://tu-usuario.pythonanywhere.com`

---

## ⚡ Deploy Frontend (Vercel)

### Paso 1: Preparar el Proyecto

Asegurate de que tu proyecto tenga:

```
frontend/
├── .env.example
├── package.json
├── public/
└── src/
```

### Paso 2: Push a GitHub

```bash
git add .
git commit -m "Preparar para deploy en Vercel"
git push origin main
```

### Paso 3: Configurar en Vercel

1. Ir a [Vercel](https://vercel.com/)
2. Registrarte con GitHub
3. Click en **Add New Project**
4. Importar tu repositorio de GitHub
5. Configurar:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Paso 4: Variables de Entorno

En Vercel, ir a **Settings → Environment Variables** y agregar:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://tu-usuario.pythonanywhere.com` |

### Paso 5: Deploy

Click en **Deploy**. Vercel automáticamente:
- ✅ Instala dependencias
- ✅ Ejecuta el build
- ✅ Despliega tu app

Tu sitio estará en: `https://tu-app.vercel.app`

---

## 🔒 Configuración Post-Deploy

### 1. Actualizar CORS en Backend

En PythonAnywhere, editá `settings.py` o el `.env`:

```python
CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app,https://tu-app-git-main.vercel.app
```

**Importante**: Incluí las URLs de preview de Vercel si querés probar antes de hacer merge.

### 2. Activar HTTPS en PythonAnywhere

1. Ir a pestaña **Web**
2. Sección **Security**
3. Habilitar **Force HTTPS**

### 3. Configurar Dominio Personalizado (Opcional)

#### En Vercel:
1. **Settings → Domains**
2. Agregar tu dominio
3. Configurar DNS según instrucciones

#### En PythonAnywhere (Plan Pago):
1. **Web → Custom domain**
2. Seguir instrucciones de configuración

---

## 🔄 Actualizar Después del Deploy

### Backend (PythonAnywhere)

```bash
# Conectarse por SSH o consola
cd ~/PuntoTecno
git pull origin main
cd backend
workon puntotecno-env
pip install -r requirements.txt  # Si hay nuevas dependencias
python manage.py migrate  # Si hay nuevas migraciones
python manage.py collectstatic --noinput

# Recargar web app desde el panel Web
```

⚠️ **IMPORTANTE**: NO subas manualmente `db.sqlite3`, perderás los datos de producción.

### Frontend (Vercel)

Vercel despliega automáticamente cuando hacés push a GitHub:

```bash
git add .
git commit -m "Actualizar frontend"
git push origin main
```

---

## 🐛 Troubleshooting

### Error: CORS

**Síntoma**: Error en consola del navegador: "CORS policy blocked"

**Solución**:
1. Verificá que la URL de Vercel esté en `CORS_ALLOWED_ORIGINS`
2. Asegurate de que `corsheaders` esté en `INSTALLED_APPS`
3. `CorsMiddleware` debe estar ANTES que `CommonMiddleware`
4. Recargá el servidor en PythonAnywhere

### Error: 502 Bad Gateway

**Síntoma**: PythonAnywhere muestra error 502

**Solución**:
1. Verificá los logs en pestaña **Web → Log files**
2. Revisá que la ruta del virtualenv sea correcta en WSGI
3. Verificá que `DJANGO_SETTINGS_MODULE` esté bien configurado

### Error: API requests fallan

**Síntoma**: Frontend no puede conectarse al backend

**Solución**:
1. Verificá que `REACT_APP_API_URL` esté configurada en Vercel
2. Hacé `console.log(process.env.REACT_APP_API_URL)` para debug
3. Verificá que el backend responda: `https://tu-usuario.pythonanywhere.com/api/auth/login/`

### Error: Static files no cargan

**Síntoma**: CSS del admin de Django no se ve

**Solución**:
```bash
python manage.py collectstatic --noinput
```
Verificá las rutas en la sección Static files del panel Web.

---

## 📞 Comandos Útiles

### Backend

```bash
# Ver logs en tiempo real
tail -f /var/log/tu-usuario.pythonanywhere.com.error.log

# Entrar al shell de Django
python manage.py shell

# Crear backup de la base de datos
cp db.sqlite3 db.sqlite3.backup

# Ver usuarios
python manage.py shell
>>> from core.models import User
>>> User.objects.all()
```

### Frontend

```bash
# Build local para verificar
npm run build

# Ver variables de entorno en build
npm run build | grep REACT_APP

# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Checklist Pre-Deploy

- [ ] Base de datos limpiada con `clean_test_data --confirm`
- [ ] Usuario admin creado
- [ ] `requirements.txt` actualizado
- [ ] `.env.example` creado con todas las variables
- [ ] CORS configurado en `settings.py`
- [ ] Variables de entorno configuradas en PythonAnywhere
- [ ] Variables de entorno configuradas en Vercel
- [ ] HTTPS activado en PythonAnywhere
- [ ] Dominio de Vercel agregado a `CORS_ALLOWED_ORIGINS`
- [ ] `DEBUG=False` en producción
- [ ] `SECRET_KEY` cambiada en producción

---

## 🎉 ¡Listo!

Tu aplicación ahora está en producción:
- 🌐 Frontend: `https://tu-app.vercel.app`
- 🔧 Backend: `https://tu-usuario.pythonanywhere.com`
- 👨‍💼 Admin: `https://tu-usuario.pythonanywhere.com/admin`

**Próximos pasos recomendados**:
1. Configurar backups automáticos de la base de datos
2. Monitorear logs regularmente
3. Considerar migrar a PostgreSQL en producción
4. Configurar dominio personalizado
5. Implementar CI/CD con GitHub Actions
