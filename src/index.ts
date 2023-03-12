import axios from 'axios';
import { ClickHouse } from 'clickhouse';
import dotenv from 'dotenv';
//@ts-ignore
import PushOver from 'pushover-notifications';

let lastIsOpen = false;

// configure environment variables
dotenv.config();

// configure clickhouse
const clickhouse = new ClickHouse({
    basicAuth: {
        username: process.env.CLICKHOUSE_USERNAME || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || '',
    }
});

const pushover = new PushOver({
    user: process.env.PUSHOVER_USER_KEY,
    token: process.env.PUSHOVER_API_TOKEN,
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
        const data = await getData() as { open: boolean, [key: string]: any };

        if (data.hasOwnProperty('open') && data.open !== lastIsOpen) {
            lastIsOpen = data.open;

            const message = {
                message: `Realraum is ${data.open ? 'open' : 'closed'} now (time is ${new Date().toLocaleTimeString("de-AT")})`,
                title: 'Realraum',
                device: 'Samsung-S21',
                priority: 1,
            };

            pushover.send(message, (error: any, _result: any) => {
                if (error) {
                    console.log(error);
                }
            });
        }

        await insertData(data);
    }, 5000);

    console.log('Started realraum inserter');
}

main();
