import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: "ftp.bloomboxanimation.com",
            user: "bloombox_iaev@bloomboxanimation.com",
            password: "antigravity03A",
            secure: false
        });

        console.log("Connected to FTP server");

        // Limpia la carpeta actual (la raíz del usuario FTP)
        await client.clearWorkingDir(); 

        console.log("Uploading files...");
        
        // Sube el contenido de dist a la raíz "/"
        await client.uploadFromDir("dist", "/");

        console.log("Upload completed successfully!");
    } catch (err) {
        console.error("Deployment failed:", err);
    }
    client.close();
}

deploy();