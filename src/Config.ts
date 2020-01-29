import fs from 'fs';
import path from 'path';
import { XycodeUI } from './XycodeUI';
import { Util } from './Util';
import { ExtConst } from './ExtConst';

export interface TaskType {
    optFeatureLabel?: string;
    label: string;
    description: string;
    command: string;
    options?: any;
    // isNativeCommand is only use for wsl or docker
    isDebug?: boolean;
    isNativeCommand?: boolean;
    platforms?: Array<string>;
    excludePlatforms?: Array<string>;
    filetypes?: Array<string>;
    encoding?: string;
    cwd?: string;
    inActive?: boolean;
    termial?: { name?: string, shellPath?: string, shellArgs?: string[] | string };
    notShowProcess?: boolean;
    beforeTriggers?: Array<{type: string, fn: string, params: []}>;
    afterTriggers?: Array<{type: string, fn: string, params: []}>;
    dockerOptions?: DockerOptions;
    pConfigType: ConfigType;
}

export interface DockerOptions {
    openTTY: boolean;
    cwd: string;
}

export enum ShellMode {
    default,
    wsl,
    docker,
    bash
}

export interface DockerConfig {
    dockerContainer: string;
    dockerAppRoot: string;
}

export interface WslConfig {
    shellPath: string;
}

export interface BashConfig {
    shellPath: string;
}

export interface ConfigType {
    filename?: string;
    tasks: Array<TaskType>;
    variables: { [x: string]: any; };
    onSaveEvents?: Array<TaskType>;
    shellMode?: ShellMode;
    docker?: DockerConfig;
    wsl?: WslConfig;
    bash?: BashConfig;
}

export class Config{
    private static defaultConfigData:Array<ConfigType>;
    private static customConfigData:Array<ConfigType>;
    private static allConfigData:Array<ConfigType>;

    private constructor() {
    }

    private static _loadConfig(configdir: string): Array<ConfigType>{
        let _config: Array<ConfigType> = [];
        if(fs.existsSync(configdir)){
            fs.readdirSync(configdir).forEach(file => {
                if(path.extname(file) !== ".json"){
                    return;
                }
                try {
                    const data: ConfigType = JSON.parse(fs.readFileSync(path.join(configdir, file), 'utf8'));
                    data.filename = path.join(configdir, file);
                    _config.push(data);
                } catch (error) {
                    XycodeUI.instance.showErrorMessage(`${file}: ${error}`);
                }
            });
        }
        return _config;
    }

    public static get data(): {tasks:Array<TaskType>, onSaveEvents:Array<TaskType> }  {
        if (!Config.defaultConfigData) {
            Config.defaultConfigData = Config._loadConfig(path.join(__dirname, './conf'));
        }
        if(ExtConst.isLoadHomeConfig){
            Config.customConfigData = Config._loadConfig(Util.configdir);
        } else {
            Config.customConfigData = [];
        }
        this.allConfigData = Config.defaultConfigData.concat(Config.customConfigData);
        let _tasks: Array<TaskType> = [];
        let _onSaveEvents: Array<TaskType> = [];
        for(let i = 0; i < this.allConfigData.length; i++) {
            _tasks = _tasks.concat(this.allConfigData[i].tasks.map(_task => {
                _task.pConfigType = this.allConfigData[i];
                return _task;
            }));
            const tmpOnSaveEvents = this.allConfigData[i].onSaveEvents;
            if(tmpOnSaveEvents){
                _onSaveEvents = _onSaveEvents.concat(tmpOnSaveEvents.map(_event => {
                    _event.pConfigType = this.allConfigData[i];
                    return _event;
                }));
            }
        }
        return { tasks:_tasks, onSaveEvents: _onSaveEvents };
    }
}

export class TaskUtil {
    static isTaskActive(task: TaskType, fileType?: string | undefined): boolean {
        const isOptionFeature = task.optFeatureLabel ? Util.optionFeatures.includes(task.optFeatureLabel) : false;
        const isSupportType = task.filetypes ? (fileType ? task.filetypes.includes(fileType) : false) : true;
        const isShowDebug = !task.isDebug || task.isDebug && Util.isDebug;
        return (!task.inActive || isOptionFeature) && isShowDebug && TaskUtil.isSupportPlatform(task)  && isSupportType;
    }

    static isDockerMode(task: TaskType) : boolean {
        return !!task.pConfigType?.docker || Util.isDockerMode;
    }

    static isWslMode(task: TaskType) : boolean {
        return (!!task.pConfigType?.wsl && Util.isWindows) || Util.isWslMode;
    }

    static isBashMode(task: TaskType) : boolean {
        return (!!task.pConfigType?.bash) || Util.isBashMode;
    }

    static isSupportPlatform(task: TaskType): boolean {
		if(task.excludePlatforms){ 
			if(task.excludePlatforms.includes(process.platform)){ return false; }
			if(task.excludePlatforms.includes("wsl") && TaskUtil.isWslMode(task)){ return false; }
			if(task.excludePlatforms.includes("bash") && TaskUtil.isBashMode(task)){ return false; }
			if(task.excludePlatforms.includes("docker") && TaskUtil.isDockerMode(task)){ return false; }
		}
		if(task.platforms === undefined){ return true;}
		if(task.platforms.includes(process.platform)){ return true; }
		if(task.platforms.includes("wsl") && (TaskUtil.isWslMode(task) || TaskUtil.isDockerMode(task))){ return true; }
		if(task.platforms.includes("bash") && (TaskUtil.isBashMode(task) || TaskUtil.isDockerMode(task))){ return true; }
		if(task.platforms.includes("docker") && TaskUtil.isDockerMode(task)){ return true; }
		return false;
    }

    static getShellPath(task: TaskType): string | undefined {
		const shellPath = Util.shellPath;
		return  TaskUtil.isWslMode(task) ? task.pConfigType?.wsl?.shellPath || shellPath || "C:\\Windows\\System32\\bash.exe" : 
                TaskUtil.isDockerMode(task) ? undefined: 
                TaskUtil.isBashMode(task) ? task.pConfigType?.bash?.shellPath : shellPath ;
	}

    static getDockerContainer(task: TaskType): string {
		return task.pConfigType?.docker?.dockerContainer || Util.dockerContainer ;
    }
    
    static getDockerAppRoot(task: TaskType): string {
		return task.pConfigType?.docker?.dockerAppRoot || Util.dockerAppRoot ;
    }
    
    static getDockerPath(filepath: string, task: TaskType): string {
		return Util.getDockerPath(filepath, TaskUtil.getDockerAppRoot(task));
    }
}