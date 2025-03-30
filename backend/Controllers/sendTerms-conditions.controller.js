import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendTermsConditions = async (req, res) =>{

    res.sendFile(path.join(__dirname, '../Views/Terms-and-Conditions.html'));

}
export default sendTermsConditions