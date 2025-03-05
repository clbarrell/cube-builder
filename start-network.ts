#!/usr/bin/env tsx

import { networkInterfaces } from "os";
import { spawn } from "child_process";
import chalk from "chalk";

// Get local IP addresses
const getLocalIpAddresses = () => {
  const nets = networkInterfaces();
  const results: { name: string; address: string }[] = [];

  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (!interfaces) continue;

    for (const net of interfaces) {
      // Skip over non-IPv4 and internal (loopback) addresses
      if (net.family === "IPv4" && !net.internal) {
        results.push({
          name,
          address: net.address,
        });
      }
    }
  }
  return results;
};

// Display connection information
const displayConnectionInfo = () => {
  const ipAddresses = getLocalIpAddresses();
  const PORT = process.env.PORT || 3001;

  console.log(chalk.green("\n=== CUBE BUILDER SERVER ==="));
  console.log(chalk.yellow("\nServer is running!"));
  console.log(
    chalk.yellow(
      "\nConnect from other devices on your network using one of these URLs:"
    )
  );

  if (ipAddresses.length === 0) {
    console.log(
      chalk.red(
        "\nNo network interfaces found. Are you connected to a network?"
      )
    );
    console.log(chalk.yellow("\nYou can still connect locally at:"));
    console.log(chalk.blue(`http://localhost:${PORT}`));
  } else {
    ipAddresses.forEach(({ name, address }) => {
      console.log(chalk.blue(`\nNetwork: ${name}`));
      console.log(chalk.green(`http://${address}:${PORT}`));
      console.log(
        chalk.yellow(
          `Or use the URL parameter: http://${address}:${PORT}?server=${address}:${PORT}`
        )
      );
    });
  }

  console.log(chalk.green("\n=== INSTRUCTIONS ==="));
  console.log(
    chalk.yellow("1. Share one of the above URLs with people on your network")
  );
  console.log(
    chalk.yellow(
      "2. They can connect to your game by opening the URL in their browser"
    )
  );
  console.log(chalk.yellow("3. Press Ctrl+C to stop the server"));
  console.log(chalk.green("\n=======================\n"));
};

// Start the server
console.log(chalk.yellow("Starting Cube Builder server..."));

// Run the server
const server = spawn("tsx", ["server.ts"], { stdio: "inherit" });

// Display connection info after a short delay
setTimeout(displayConnectionInfo, 1000);

// Handle server exit
server.on("close", (code) => {
  if (code !== 0) {
    console.log(chalk.red(`Server process exited with code ${code}`));
  }
  process.exit(code || 0);
});

// Forward termination signals to the server
process.on("SIGINT", () => {
  server.kill("SIGINT");
});

process.on("SIGTERM", () => {
  server.kill("SIGTERM");
});
