import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { inc } from "semver";
import { execSync } from "child_process";

// Define the default version increment type
let releaseType = "patch";

// Process command line arguments
const args = process.argv.slice(2);
if (args.includes("-m")) {
  releaseType = "minor";
} else if (args.includes("-M")) {
  releaseType = "major";
}

try {
  // Get package.json content
  const packageJsonPath = resolve(__dirname, "package.json");
  const packageJsonData = readFileSync(packageJsonPath, "utf8");

  // Parse and increment the version
  const packageJson = JSON.parse(packageJsonData);
  const oldVersion = packageJson.version;
  const newVersion = inc(oldVersion, releaseType);

  if (!newVersion) {
    console.error("Error incrementing version number.");
    process.exit(1);
  }

  // Replace the old version with the new version
  packageJson.version = newVersion;

  // Write the updated JSON back to package.json
  const updatedPackageJsonData = JSON.stringify(packageJson, null, 2);
  writeFileSync(packageJsonPath, updatedPackageJsonData);

  // Log the version change
  console.log(`Version bumped from ${oldVersion} to ${newVersion}`);

  // Build the package
  execSync("npm run build");

  // Publish to npm
  // Make sure you're already logged in to npm (npm login)
  execSync("npm publish", { stdio: "inherit" });
  console.log("Successfully published the package");

  // Commit the version change
  execSync(`miwi sync "Publishing ${newVersion}"`);
} catch (err) {
  console.error("Error reading, updating, or publishing the package.", err);
  process.exit(1);
}
