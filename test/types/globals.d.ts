declare global {
    namespace NodeJS {
        interface Global {
            __MONGOD__: string;
        }
    }
}
