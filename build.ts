import { build, type Options } from "tsup";
import { $ } from "bun";

const tsupConfig: Options = {
	entry: ["./src/index.ts"],
	splitting: false,
	sourcemap: false,
	minify: true,
	clean: true,
	bundle: true,
	dts: true,
	target: "es2020",
	external: ["@napi-rs/canvas"],
} satisfies Options;

await Promise.all([
	build({
		outDir: "dist",
		format: "esm",
		...tsupConfig,
	}),
	build({ outDir: "dist/cjs", format: "cjs", ...tsupConfig }),
]);

await Promise.all([
	$`mv ./dist/index.d.mts ./dist/index.d.ts`,
	$`cp ./src/weathericons-font.ttf ./dist/`,
	$`cp ./src/weathericons-font.ttf ./dist/cjs/`,
]);

process.exit();
