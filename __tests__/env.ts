import dotenv from "dotenv";

it('Enviroment varibles properly defined', () => {
    dotenv.config({ path: ".env.local" })
    expect(process.env.MONGODB_PROTO).toBeDefined();
    expect(process.env.MONGODB_DOMAIN).toBeDefined();
    expect(process.env.MONGODB_USERNAME).toBeDefined();
    expect(process.env.MONGODB_PASSWORD).toBeDefined();
    expect(process.env.TOKEN_SECRET).toBeDefined();
    expect(process.env.MQTT_URI).toBeDefined();
    expect(process.env.MQTT_USERNAME).toBeDefined();
    expect(process.env.MQTT_PASSWORD).toBeDefined();
})