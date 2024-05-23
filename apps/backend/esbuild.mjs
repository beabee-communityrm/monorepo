import { exec } from 'child_process';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { context, build } from 'esbuild';

const options = {
    entryPoints: ['src/app.ts'],
    bundle: true,
    platform: 'node',
    outfile: 'built/app.js',
    external: ['@koa/cors', '@babel/*', 'pg'],
}

const onBuildEnd = async (onSuccess) => {
    if (!onSuccess) {
        return;
    }
    exec(onSuccess, (err, _stdout, _stderr) => {
        if (err) {
            console.error(`Failed, running "${onSuccess}"`, err);
            return;
        }
        console.log(`Success, running "${onSuccess}"`);
    });
}

const initOnSuccessPlugin = (onSuccess) => {
    return {
        name: 'onSuccess',
        setup(build) {
            build.onEnd(async (result) => {
                if (result.warnings.length > 0) {
                    console.warn('Rebuild warnings:', result.warnings);
                }
                if (result.errors.length > 0) {
                    console.error('Rebuild failed:', result.errors);
                } else {
                    console.log('Rebuild succeeded');
                    await onBuildEnd(onSuccess);
                }
            })
        },
    }
}

const buildHandler = async () => {
    await build(options);
}

const watchHandler = async (argv) => {
    const { onSuccess } = argv;
    const successPlugin = initOnSuccessPlugin(onSuccess);
    const ctx = await context({
        ...options,
        plugins: [successPlugin]
    })
    await ctx.watch();
}

yargs(hideBin(process.argv))
    .command('watch', 'Watch for changes and rebuild', (yargs) => {
        return yargs.option('onSuccess', {
            type: 'string'
        })
    }, watchHandler)
    .command('build', 'Build the project', (yargs) => yargs, buildHandler)
    .help()
    .parse()

