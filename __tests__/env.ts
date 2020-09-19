import dotenv from "dotenv";

it('Enviroment varibles properly defined', () => {
    dotenv.config({ path: ".env.local" })
    expect(process.env).toHaveProperty("MONGODB_PROTO");
    expect(process.env).toHaveProperty("MONGODB_DOMAIN");
    expect(process.env).toHaveProperty("MONGODB_USERNAME");
    expect(process.env).toHaveProperty("MONGODB_PASSWORD");
    expect(process.env).toHaveProperty("TOKEN_SECRET");
    expect(process.env).toHaveProperty("MQTT_URI");
    expect(process.env).toHaveProperty("MQTT_USERNAME");
    expect(process.env).toHaveProperty("MQTT_PASSWORD");
})