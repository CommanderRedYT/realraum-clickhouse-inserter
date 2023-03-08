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

export async function getData(): Promise<object> {
    const response = await axios.get(url);
    return response.data;
}

export async function insertData(data: object): Promise<void> {
    const query = `INSERT INTO ${process.env.CLICKHOUSE_DATABASE}.${process.env.CLICKHOUSE_TABLE} (json)`;
    const socket = clickhouse.insert(query).stream();
    socket.writeRow([JSON.stringify(data)]);

    try {
        await socket.exec();
    } catch (error) {
        console.log(data, error);
    }
}

export default function main(): void {
    // execute every 5 seconds
    setInterval(async () => {
        const data = await getData();
        await insertData(data);
    }, 5000);

    console.log('Started realraum inserter');
}

main();
