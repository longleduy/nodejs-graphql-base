class ConvertUtil {
  toGraphQlClass<T>(Type:{ new (): T; }, mongooseObject: any): T {
    const graphqlObject: any = new Type();
    const propsArray: string[] = Object.keys(graphqlObject);
    propsArray.forEach((key) => {
      if (mongooseObject[key]) {
        graphqlObject[key] = mongooseObject[key];
      }
      // eslint-disable-next-line no-compare-neg-zero
      if (graphqlObject[key] === '-string' || graphqlObject[key] === -0) {
        delete graphqlObject[key];
      }
    });
    return graphqlObject;
  }

  copyInterface<C, I>(CType:{ new (): C; }, object: any): I {
    const interfaceObject: any = {} as I;
    const propsArray: string[] = Object.keys(new CType());
    propsArray.forEach((key) => {
      if (object[key]) {
        interfaceObject[key] = object[key];
      }
    });
    return interfaceObject;
  }
}
export default new ConvertUtil();
