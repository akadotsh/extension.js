// ██████╗ ███████╗██╗   ██╗███████╗██╗      ██████╗ ██████╗
// ██╔══██╗██╔════╝██║   ██║██╔════╝██║     ██╔═══██╗██╔══██╗
// ██║  ██║█████╗  ██║   ██║█████╗  ██║     ██║   ██║██████╔╝
// ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██╔═══╝
// ██████╔╝███████╗ ╚████╔╝ ███████╗███████╗╚██████╔╝██║
// ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝ ╚═╝

import path from 'path'
import fs from 'fs'
import {type Compiler, type WebpackPluginInstance} from 'webpack'
import * as messages from '../../lib/messages'
import {installOptionalDependencies} from '../../lib/utils'
import {JsFramework} from '../../webpack-types'

let userMessageDelivered = false

export function isUsingReact(projectPath: string) {
  const packageJsonPath = path.join(projectPath, 'package.json')
  const manifestJsonPath = path.join(projectPath, 'manifest.json')

  if (!fs.existsSync(packageJsonPath)) {
    return false
  }

  const packageJson = require(packageJsonPath)
  const reactAsDevDep =
    packageJson.devDependencies && packageJson.devDependencies.react
  const reactAsDep = packageJson.dependencies && packageJson.dependencies.react

  // This message is shown for each JS loader we have, so we only want to show it once.
  if (reactAsDevDep || reactAsDep) {
    if (!userMessageDelivered) {
      const manifest = require(manifestJsonPath)
      console.log(messages.isUsingTechnology(manifest, 'React'))

      userMessageDelivered = true
    }
  }

  return !!reactAsDevDep || !!reactAsDep
}

export async function maybeUseReact(
  compiler: Compiler,
  projectPath: string
): Promise<JsFramework | undefined> {
  if (!isUsingReact(projectPath)) return undefined

  try {
    require.resolve('@pmmmwh/react-refresh-webpack-plugin')
  } catch (e) {
    const reactDependencies = [
      'react-refresh',
      '@pmmmwh/react-refresh-webpack-plugin',
      '@svgr/webpack',
      'react-refresh-typescript'
    ]

    await installOptionalDependencies('React', reactDependencies)

    // The compiler will exit after installing the dependencies
    // as it can't read the new dependencies without a restart.
    console.log(messages.youAreAllSet('React'))
    process.exit(0)
  }

  const reactPlugins: WebpackPluginInstance[] = [
    new (require('@pmmmwh/react-refresh-webpack-plugin'))() //.apply(compiler)
  ]

  return {
    plugins: reactPlugins,
    loaders: undefined,
    alias: undefined
  }
}
