CREATE TABLE IF NOT EXISTS realraum
(
    timestamp DateTime64(6) MATERIALIZED now() CODEC(DoubleDelta, LZ4),
    json String CODEC(ZSTD(1)),

    api String MATERIALIZED JSONExtractString(json, 'api'),

    state_open boolean MATERIALIZED JSONExtractBool(JSONExtractRaw(json, 'state'), 'open'),
    state_lastchange DateTime64(6) MATERIALIZED toDateTime(JSONExtractInt(JSONExtractRaw(json, 'state'), 'lastchange'), 'UTC'),

    door_locked Array(String) MATERIALIZED JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'door_locked'),
    temperature Array(String) MATERIALIZED JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'temperature'),
    humidity Array(String) MATERIALIZED JSONExtractArrayRaw(JSONExtractRaw(json, 'sensors'), 'humidity'),

    total_member_count UInt64 MATERIALIZED JSONExtractUInt(JSONExtractRaw(JSONExtractRaw(json, 'sensors'), 'total_member_count')[0], 'value')
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp)
SETTINGS index_granularity = 8192;
