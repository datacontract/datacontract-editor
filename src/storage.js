export function storeDataContractYaml(yaml) {
    localStorage.setItem("dataContractYaml", yaml);
    localStorage.setItem("dataContractYamlUpdated", new Date().toISOString());
}
export function loadDataContractYaml() {
    return localStorage.getItem("dataContractYaml");
}
export function isFirstLoadOfDataContractEditor() {
    return localStorage.getItem("dataContractYamlUpdated") === null;
}
