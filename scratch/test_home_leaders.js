import { getHomeLeaders } from "../src/app/actions/home";

async function main() {
  const leaders = await getHomeLeaders();
  console.log("Homepage Leaders count:", leaders.length);
  console.log("Sample Homepage Leader:", leaders[0]);
}

main().catch(console.error);
