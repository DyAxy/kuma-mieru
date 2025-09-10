import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';

const banner = `
██╗  ██╗██╗   ██╗███╗   ███╗ █████╗     ███╗   ███╗██╗███████╗██████╗ ██╗   ██╗
██║ ██╔╝██║   ██║████╗ ████║██╔══██╗    ████╗ ████║██║██╔════╝██╔══██╗██║   ██║
█████╔╝ ██║   ██║██╔████╔██║███████║    ██╔████╔██║██║█████╗  ██████╔╝██║   ██║
██╔═██╗ ██║   ██║██╔████╔██║██╔══██║    ██║╚██╔╝██║██║██╔══╝  ██╔══██╗██║   ██║
██║  ██╗╚██████╔╝██║ ╚═╝ ██║██║  ██║    ██║ ╚═╝ ██║██║███████╗██║  ██║╚██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝    ╚═╝     ╚═╝╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ 
`;

type ChalkColor = 'green' | 'blue' | 'yellow' | 'red' | 'magenta' | 'cyan' | 'white' | 'gray';

interface ConfigItem {
  name: string;
  value: string | undefined | boolean;
  defaultValue?: string;
}

interface ConfigGroup {
  title: string;
  icon: string;
  color: ChalkColor;
  items: ConfigItem[];
}

const getEnvStatus = (value: string | undefined | boolean, defaultValue = 'Not configured') => {
  if (typeof value === 'boolean') {
    return value ? chalk.green('true') : chalk.yellow('false');
  }
  return value ? chalk.green(value) : chalk.yellow(defaultValue);
};

const printConfigGroup = ({ title, icon, color, items }: ConfigGroup) => {
  console.log(chalk[color](`${icon} ${title}:`));
  for (const { name, value, defaultValue } of items) {
    console.log(chalk.blue(`  - ${name}:`), getEnvStatus(value, defaultValue));
  }
  console.log('');
};

const getGeneratedConfig = () => {
  try {
    const configPath = path.join(process.cwd(), 'config', 'generated-config.json');
    if (fs.existsSync(configPath)) {
      const configStr = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configStr);
    }
  } catch (err) {
    console.error('[banner] [getGeneratedConfig] [error]', err);
  }
  return null;
};

const generatedConfig = getGeneratedConfig();

const configGroups: ConfigGroup[] = [
  {
    title: 'Environment',
    icon: '📡',
    color: 'blue',
    items: [
      {
        name: 'NODE_ENV',
        value: process.env.NODE_ENV,
        defaultValue: 'development',
      },
      {
        name: 'CI_MODE',
        value: process.env.CI_MODE,
        defaultValue: 'false',
      },
    ],
  },
  {
    title: 'Basic Configuration',
    icon: '🌐',
    color: 'blue',
    items: [
      {
        name: 'UPTIME_KUMA_BASE_URL',
        value: generatedConfig?.baseUrl || process.env.UPTIME_KUMA_BASE_URL,
      },
      {
        name: 'PAGE_ID',
        value: generatedConfig?.pageId || process.env.PAGE_ID,
      },
    ],
  },
  {
    title: 'Features',
    icon: '✨',
    color: 'magenta',
    items: [
      {
        name: 'FEATURE_EDIT_THIS_PAGE',
        value: generatedConfig?.isEditThisPage,
        defaultValue: 'false (Default)',
      },
      {
        name: 'FEATURE_SHOW_STAR_BUTTON',
        value: generatedConfig?.isShowStarButton,
        defaultValue: 'true (Default)',
      },
    ],
  },
  {
    title: 'Custom Metadata',
    icon: '📋',
    color: 'magenta',
    items: [
      {
        name: 'FEATURE_TITLE',
        value: generatedConfig?.siteMeta?.title,
        defaultValue: 'Using Default',
      },
      {
        name: 'FEATURE_DESCRIPTION',
        value: generatedConfig?.siteMeta?.description,
        defaultValue: 'Using Default',
      },
      {
        name: 'FEATURE_ICON',
        value: generatedConfig?.siteMeta?.icon,
        defaultValue: 'Using Default',
      },
    ],
  },
];

const printStartupInfo = () => {
  console.log(chalk.cyan(banner));
  console.log(chalk.green(`🚀 Kuma Mieru [v${process.env.APP_VERSION}] is starting...\n`));

  if (generatedConfig) {
    console.log(chalk.green('[banner] [printStartupInfo] [config file found]\n'));
  } else {
    console.log(chalk.yellow('[banner] [printStartupInfo] [config file not found]\n'));
  }

  for (const group of configGroups) {
    printConfigGroup(group);
  }
};

printStartupInfo();
