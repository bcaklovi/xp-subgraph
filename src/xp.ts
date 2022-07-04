import { BigInt, Address, log } from "@graphprotocol/graph-ts"
import {
  XP,
  MetaTransactionExecuted,
  NewActions,
  OwnershipTransferred,
  Paused,
  ProjectCreated,
  Unpaused,
  UpdateScore,
  UpdateScoreFailed,
  ProjectCreatedActionsStruct,
  NewScoreTypes,
  RemoveScoreType
} from "../generated/XP/XP"
import { Action, Project, Score, Scoreboard, ScoreUpdate } from '../generated/schema'

export function handleMetaTransactionExecuted(
  event: MetaTransactionExecuted
): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }

export function handlePaused(event: Paused): void { }

export function handleProjectCreated(event: ProjectCreated): void {
  let currentProject = Project.load(event.params.projectId)

  if (!currentProject) {
    currentProject = new Project(event.params.projectId)
  }
  currentProject.name = event.params.name;
  let ownersStrings: string[] = [];
  let updatersStrings: string[] = [];
  // let scoreTypesStrings: string[] = [];

  for (let i = 0; i < event.params.owners.length; i++) {//Owners
    ownersStrings.push(event.params.owners[i].toHexString())
  }
  for (let i = 0; i < event.params.updaters.length; i++) { //Updaters
    updatersStrings.push(event.params.updaters[i].toHexString())
  }
  // for (let i = 0; i < event.params._scoreTypes.length; i++) { //Score types
  //   scoreTypesStrings.push(event.params._scoreTypes[i].toHexString())
  // }

  for (let i = 0; i < event.params.actions.length; i++) {
    log.info('Action info: {}', [event.params.actions[i].name]);

    let currentAction = Action.load(event.params.projectId.toHexString() + "_" + event.params.actions[i].name);

    if (!currentAction) {
      currentAction = new Action(event.params.projectId.toHexString() + "_" + event.params.actions[i].name)
    }

    currentAction.name = event.params.actions[i].name;
    currentAction.points = event.params.actions[i].points;
    currentAction.direction = BigInt.fromI32(event.params.actions[i].direction);

    currentAction.project = event.params.projectId;

    currentAction.save();
  }

  currentProject.owners = ownersStrings;
  currentProject.updaters = updatersStrings;
  currentProject.scoreTypes = event.params._scoreTypes;
  currentProject.creator = event.params.creator.toHexString()

  currentProject.save()
}

export function handleUnpaused(event: Unpaused): void { }

export function handleUpdateScore(event: UpdateScore): void { 
  // Update Scoreboard
  let currentScoreboard = Scoreboard.load(event.params.projectId.toHexString() + "_" + event.params.targetAddress.toHexString());
  
  if (!currentScoreboard) {
    currentScoreboard = new Scoreboard(event.params.projectId.toHexString() + "_" + event.params.targetAddress.toHexString());
    
    if (event.params.direction == 0) { 
      currentScoreboard.totalScore = event.params.pointChange;
    } else {
      currentScoreboard.totalScore = BigInt.fromI32(0);
    }
  } else {
    if (event.params.direction == 0) {
      currentScoreboard.totalScore = currentScoreboard.totalScore.plus(event.params.pointChange);
    } else {
      if (currentScoreboard.totalScore.minus(event.params.pointChange).ge(BigInt.fromI32(0))) {
        currentScoreboard.totalScore = currentScoreboard.totalScore.minus(event.params.pointChange);
      } else {
        currentScoreboard.totalScore = BigInt.fromI32(0);
      }
    }
  }

  currentScoreboard.address = event.params.targetAddress.toHexString();
  currentScoreboard.project = event.params.projectId;

  currentScoreboard.save();

  // Update Score
  let currentScore = Score.load(event.params.projectId.toHexString() + "_" + event.params.targetAddress.toHexString() + "_" + event.params.scoreType);

  if (!currentScore) {
    currentScore = new Score(event.params.projectId.toHexString() + "_" + event.params.targetAddress.toHexString() + "_" + event.params.scoreType);
  } 

  currentScore.points = event.params.newPoints;
  currentScore.scoreboard = event.params.projectId.toHexString() + "_" + event.params.targetAddress.toHexString();
  currentScore.scoreType = event.params.scoreType;
  currentScore.address = event.params.targetAddress.toHexString();
  currentScore.project = event.params.projectId;

  currentScore.save();

  // Want to avoid doing this but necessary for frontend currently
  // Create entity for a score update (used for creating XP log on frontend)
  let currentScoreUpdate = ScoreUpdate.load(event.params.updateId);

  if (!currentScoreUpdate) {
    currentScoreUpdate = new ScoreUpdate(event.params.updateId);
  } 

  currentScoreUpdate.pointChange = event.params.pointChange;
  currentScoreUpdate.scoreboard = event.params.projectId.toHexString() + "_" + event.params.targetAddress.toHexString();
  currentScoreUpdate.scoreType = event.params.scoreType;
  currentScoreUpdate.actionName = event.params.actionName;
  currentScoreUpdate.address = event.params.targetAddress.toHexString();
  currentScoreUpdate.project = event.params.projectId;
  currentScoreUpdate.createdAt = event.block.timestamp
  currentScoreUpdate.direction = BigInt.fromI32(event.params.direction);

  currentScoreUpdate.save();

  // Update score types on project entity
  let currentProject = Project.load(event.params.projectId)

  if (currentProject) {
    currentProject.scoreTypes = event.params.scoreTypes;

    currentProject.save();
  }

}

export function handleNewActions(event: NewActions): void { 
  for (let i = 0; i < event.params.actions.length; i++) {

    let currentAction = Action.load(event.params.projectId.toHexString() + "_" + event.params.actions[i].name);

    if (!currentAction) {
      currentAction = new Action(event.params.projectId.toHexString() + "_" + event.params.actions[i].name)
    }

    currentAction.name = event.params.actions[i].name;
    currentAction.points = event.params.actions[i].points;
    currentAction.direction = BigInt.fromI32(event.params.actions[i].direction);

    currentAction.project = event.params.projectId;

    currentAction.save();
  }
}

export function handleNewScoreTypes(event: NewScoreTypes): void {
  let currentProject = Project.load(event.params.projectId);

  if (currentProject) {
    currentProject.scoreTypes = event.params.allScoreTypes;

    currentProject.save();
  }
}

export function handleRemoveScoreTypes(event: RemoveScoreType): void {
  let currentProject = Project.load(event.params.projectId);

  if (currentProject) {
    currentProject.scoreTypes = event.params.allScoreTypes;

    currentProject.save();
  }
}

export function handleUpdateScoreFailed(event: UpdateScoreFailed): void { }
