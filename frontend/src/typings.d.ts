/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
/*
Code added to allow components to read from configuration json file (app/config.json)
*/
declare module "*.json" {
    const value: any;
    export default value;
}
