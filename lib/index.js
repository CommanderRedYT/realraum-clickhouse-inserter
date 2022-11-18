var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import { ClickHouse } from 'clickhouse';
import dotenv from 'dotenv';
// configure environment variables
dotenv.config();
// configure clickhouse
const clickhouse = new ClickHouse({
    basicAuth: {
        username: process.env.CLICKHOUSE_USERNAME || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || '',
    }
});
const url = 'https://realraum.at/status.json';
export function getData() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios.get(url);
        return response.data;
    });
}
export function insertData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `INSERT INTO ${process.env.CLICKHOUSE_DATABASE}.${process.env.CLICKHOUSE_TABLE} (json)`;
        const socket = clickhouse.insert(query).stream();
        socket.writeRow([JSON.stringify(data)]);
        try {
            yield socket.exec();
        }
        catch (error) {
            console.log(data, error);
        }
    });
}
export default function main() {
    // execute every 1 seconds
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        const data = yield getData();
        yield insertData(data);
    }), 1000);
}
main();
//# sourceMappingURL=index.js.map