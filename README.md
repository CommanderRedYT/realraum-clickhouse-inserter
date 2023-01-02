# realraum-clickhouse-inserter
A clickhouse inserter written in NodeJS to log realraum status.

For convenience, there also is a SQL File for Clickhouse to create the table and a pm2 config file for easy deployment.

## Prerequisites
- ClickHouse instance (see [here](https://clickhouse.com/docs/en/install/))
- A table with the correct columns (see [realraum.sql](realraum.sql))
- (Optional) A grafana instance with clickhouse datasource

## Installation
1. Clone the repository to your local filesystem.
2. Execute `cp .env.default .env` and open it in an editor.
3. Enter the credentials to your clickhouse instance. The user only needs to have INSERT rights to the table configured below.
4. Execute `pm2 start lib/index.js`. **(Skip if not using pm2)**
5. The data inserter should be ready now.
