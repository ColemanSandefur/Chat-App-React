const cloneMap = <TKey extends number | string, T>(map: {[key in TKey]: T}) => {
    if (typeof Object.keys(map)[0] === "number") {
        let newMap:{[key: number]: T} = {};
        for (let i in map) {
            newMap[i as number] = map[i];
        }
        return newMap;
    }

    let newMap:{[key: string]: T} = {};
    for (let i in map) {
        newMap[i] = map[i];
    }
    return newMap;
}

const toArray = <TKey extends number | string, T>(map: {[key in TKey]: T}) => {
    if (typeof Object.keys(map)[0] === "number") {
        let newMap = map as unknown as {[key: number]: T};
        let array: any = [];

        Object.keys(newMap).forEach((el:any) => {
            // let key = <number><unknown>el;
            array.push(newMap[el]);
        });

        return array;
    }

    let newMap = map as unknown as {[key: string]: T};
    let array: any = [];

    Object.keys(newMap).forEach((el:any) => {
        // let key = <number><unknown>el;
        array.push(newMap[el]);
    });

    return array;
}

export {cloneMap, toArray};