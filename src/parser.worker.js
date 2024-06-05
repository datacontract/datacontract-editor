import yaml from "js-yaml";

self.onmessage = function(message) {
    if (message.data.command === "parse") {
        try {
            const jsonContent = yaml.load(message.data.dataContractYaml);

            postMessage({status: "success", json: jsonContent});
        } catch (e) {
            postMessage({status: "error", error: e});
        }
    }
};
