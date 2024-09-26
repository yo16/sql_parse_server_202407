import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Parser, Option as NSPOption, AST} from 'node-sql-parser';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3001;
const cors_url = process.env.CORS || "http://localhost:5173";
const isDevelopMode = (process.env.mode === "development");

if (isDevelopMode) {
    console.log(`port: ${port}`);
    console.log(`cors_url: ${cors_url}`);
}

app.use(
    cors({
        origin: cors_url,
        credentials: true,
        optionsSuccessStatus: 200,
    })
);
app.use(
    bodyParser.urlencoded({extended: true})
);
app.use(
    bodyParser.json()
);

// node-sql-parser instance
const parser = new Parser();


app.get('/', (req, res) => res.type('html').send('<!DOCTYPE html><html><body>/</body></html>'));
app.post('/sql', (req: Request, res: Response) => {
    if (isDevelopMode) { console.log('/sql posted!'); }
    try {
        res.setHeader("Access-Control-Allow-Origin", cors_url);
    } catch (e) {
        console.error(e);
    }

    // bodyから情報を取り出す
    const query = req.body.query;
    if (!query) { res.type('json').send({})}
    if (query.length === 0) { res.type('json').send({})}
    let database = req.body.database;
    if ( (!database) || (database.length === 0) ) {
        // defaultはbigquery
        database = 'bigquery';
    }

    // node-sql-parserを使ってastにして返す
    let ast: AST[] = [];
    try {
        const opt: NSPOption = {
            database,
        };

        // parse
        const ret = parser.parse(query, opt);

        // 戻り値の調整
        if (Array.isArray(ret.ast)) {
            ast = ret.ast;
        } else {
            ast = [ret.ast];
        }
        // const tableList = ret.tableList;
        // const columnList = ret.columnList;

    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        res.type('json').send({
            result: 9,
            message: 'Could not parse.'
        });
    }

    if (isDevelopMode) { console.log(ast); }
    res.type('json').send({
        result: 0,
        ast,
    });
})


const server = app.listen(port, () => {
    console.log(`SqlParseServer listening on port ${port}!`);
    console.log(`MODE=${process.env.mode}`);
});
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
