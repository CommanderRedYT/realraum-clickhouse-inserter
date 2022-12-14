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
export async function getData() {
    const response = await axios.get(url);
    return response.data;
}
export async function insertData(data) {
    const query = `INSERT INTO ${process.env.CLICKHOUSE_DATABASE}.${process.env.CLICKHOUSE_TABLE} (json)`;
    const socket = clickhouse.insert(query).stream();
    socket.writeRow([JSON.stringify(data)]);
    try {
        await socket.exec();
    }
    catch (error) {
        console.log(data, error);
    }
}
export default function main() {
    // execute every 1 seconds
    setInterval(async () => {
        const data = await getData();
        await insertData(data);
    }, 1000);
    console.log('Started realraum inserter');
}
main();
//# sourceMappingURL=index.js.map