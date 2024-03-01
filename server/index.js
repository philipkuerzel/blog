import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs/promises';
import {fileTypeFromBuffer} from 'file-type';

// initialize PORT, app, dbFilePath and upload
const PORT = 3000;
const app = express();
const dbFilePath = './blog.json';
const upload = multer({ dest: 'uploads/' });

const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    };

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static('uploads'));

const readDataJson = async () => JSON.parse(await fs.readFile(dbFilePath, 'utf-8'));
const writeDataJson = (data) => fs.writeFile(dbFilePath, JSON.stringify(data));

try {
    await fs.access(dbFilePath);
} catch (err) {
    await writeDataJson([]);
}

// GET
app.get("/blog", async (req, res) => {
    try {
        const data = await readDataJson();
        res.json(data);
    }catch (err) {
        res.status(500).send('Internal Server Error');
    }
})

// POST
app.post("/blog", upload.single('image'), async (req, res) => {
    try {
        const imagePath = req.file.path

        const imageBuffer = await fs.readFile(`./${imagePath}`)
        const fileTypeResult = await fileTypeFromBuffer (imageBuffer)
        const imagePathWithExtension = `${imagePath}.${fileTypeResult.ext}`

        fs.rename(`./${imagePath}`, `./${imagePathWithExtension}`)

        const newBlog = {...req.body, image: `http://localhost:3000/${imagePathWithExtension}`};
        if (!newBlog.title || !newBlog.content) {
            res.status(400).send('Title and Content are required');
            return;
        }
        const data = await readDataJson();
        await writeDataJson([...data, newBlog]);
        
        res.status(201).json(newBlog);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
})

// PATCH
app.patch("/blog/:id", async (req, res) => {
    try{
        const title = req.body.title;
        const blogPatch = req.body
        const blogs = await readDataJson();
        const newBlogs = blogs.map(blog => {
            if (blog.id === req.params.id) {
                return {...blog, ...blogPatch};
            }
            return blog;
        });
        await writeDataJson(newBlogs);
        res.status(204).send();
    }catch (err) {
        res.status(500).send('Internal Server Error');
    }
    res.end()
})

// LISTEN
app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
})