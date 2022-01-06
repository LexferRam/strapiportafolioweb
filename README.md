# Strapi application

Esta app usa github action para desplagar en el container registry de heroku:

## PASOS

1. **Crear app en heroku** y en la pestana de "Resources" agregar(add-ons) "Heroku Postgres"

2. **Crear applicacion de strapi V4**, seleccionar 'custom' y seleccionar **Postgres** como base de datos(buscar credenciales en 'resources> settings> View credentials' de la BDs creada en Heroku) y agregar los campos solicitados por el CLI de strapi(nombre BDs,host,port,username,password)
   * **NOTA** colocar en 'enable ssl connection' ==> N
   * **NOTA 2:** **Crear .env**. Estas credenciales de BDs se deben agregar como variables de entorno en Heroku y de forma local(ya que por defecto estas credenciales se agregan de forma directa en el archivo: /config/database.js)

```npm
npx create-strapi-app@latest .
```

* ejemplo .env

```env
DATABASE_HOST = ec2-34-197-195-181.compute-1.amazonaws.com
DATABASE_NAME = d4ki0p1qamdm43
DATABASE_USERNAME = nrynmriystsmyh
DATABASE_PASSWORD = 455f3c0ccd12ec5fcb6c320f372e3d5093390671e6caf525c384164f4013b605
```


* Ejemplor de 'database.js':

```javascript
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: process.env.DATABASE_HOST,
      port: env.int('DATABASE_PORT', 5432),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      schema: env('DATABASE_SCHEMA', 'public'), // Not required
      ssl: {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
      },
    },
    debug: false,
  },
});
```

1. **Agregar Dockerfile y .dockerignore**

```Dockerfile
FROM node:16

WORKDIR /usr/src/api

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 1337

CMD ["npm", "start"]
```

4. **Crear repositorio en Github inicializar proyecto en git y subir al repo remoto,** y en opcion de "actions" agregar el siguiente github action(se deben agregar los sig. secrets al repositorio de github: HEROKU_API_KEY y HEROKU_APP_NAME )

 **NOTA:** Buscar HEROKU_API_KEY en heroku "Account Settings"(arriba a la derecha)> Copiar "API Key", finalmente agregar en github sevcrets del repositorio creado

```npm
name: Push Container to Heroku

on: 
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Login to Heroku Container registry
      env: 
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run: heroku container:login 
    - name: Build and push
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run: heroku container:push -a ${{ secrets.HEROKU_APP_NAME }} web 
    - name: Release
      env:
        HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run: heroku container:release -a ${{ secrets.HEROKU_APP_NAME }} web 
```

5. **Crear cuenta en Cloudinary**:

* Instalar:
  
  ```npm
  npm i @strapi/provider-upload-cloudinary
  ```

* Agregar el sig archivo(config/plugins.js):
  
  ```javascript
    module.exports = ({ env }) => ({
        // ...
        upload: {
            config: {
                provider: 'cloudinary',
                providerOptions: {
                    cloud_name: env('CLOUDINARY_NAME'),
                    api_key: env('CLOUDINARY_KEY'),
                    api_secret: env('CLOUDINARY_SECRET'),
                },
                actionOptions: {
                    upload: {},
                    delete: {},
                },
            },
        },
        // ...
    });

    ```

*  **Agregar las sig. variables de entorno en el proyecto y en Heroku**(se obtienen en el dashboard de Cloudinary)
  

```cmd

CLOUDINARY_NAME = ********
CLOUDINARY_KEY = ********
CLOUDINARY_SECRET = ******
```

* El archivo middleware.js agregar:

```javascript

module.exports = [
module.exports = [
  // ...

  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];

```


6. Cada vez que se haga un push a la rama master, se compilara el proyecto y se generara una imagen que se subira al container registry de heroku.
   * **ABRIR APP** ==> ir a la consola de heroku del proyecto creado y seleccionar "Open App"