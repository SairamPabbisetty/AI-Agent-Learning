
type Tool = {
    name: string;
    execute: () => string;
};

const tools: Tool[] = [
    {
        name: "getDate",
        execute: () => new Date().toDateString()
    },
    {
        name: "getWeather",
        execute: () => "Weather: 28°C, Sunny (mock data)"
    }
];

// Simulated user request
const userRequest = "Tell me today's weather";

// Simulated decision by an agent
function selectTool(request: string): Tool | undefined {
    if (request.toLowerCase().includes("date")) {
        return tools.find(tool => tool.name === "getDate");
    }

    if (request.toLowerCase().includes("weather")) {
        return tools.find(tool => tool.name === "getWeather");
    }

    return undefined;
}

// Agent execution
function runAgent(request: string): void {
    console.log("Goal:", request);

    const selectedTool = selectTool(request);

    if (!selectedTool) {
        console.log("No suitable tool found.");
        return;
    }

    console.log("Selected tool:", selectedTool.name);

    const result = selectedTool.execute();

    console.log("Tool result:", result);
    console.log("Agent completed.");
}

runAgent(userRequest);
