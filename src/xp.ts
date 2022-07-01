import { BigInt } from "@graphprotocol/graph-ts"
import {
  XP,
  MetaTransactionExecuted,
  NewActions,
  NewScoreTypes,
  OwnershipTransferred,
  Paused,
  ProjectCreated,
  ProjectOwnerAdded,
  ProjectOwnerRemoved,
  ProjectUpdaterAdded,
  ProjectUpdaterRemoved,
  RemoveScoreType,
  Unpaused,
  UpdateScore,
  UpdateScoreFailed
} from "../generated/XP/XP"
import { ExampleEntity } from "../generated/schema"

export function handleMetaTransactionExecuted(
  event: MetaTransactionExecuted
): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.userAddress = event.params.userAddress
  entity.relayerAddress = event.params.relayerAddress

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.admins(...)
  // - contract.getActionsFromProjectId(...)
  // - contract.getChainID(...)
  // - contract.getNonce(...)
  // - contract.getOwnersFromProjectId(...)
  // - contract.getScore(...)
  // - contract.getScoreTypesFromProject(...)
  // - contract.getUpdatersFromProjectId(...)
  // - contract.idToProject(...)
  // - contract.owner(...)
  // - contract.paused(...)
  // - contract.verify(...)
}

export function handleNewActions(event: NewActions): void {}

export function handleNewScoreTypes(event: NewScoreTypes): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePaused(event: Paused): void {}

export function handleProjectCreated(event: ProjectCreated): void {}

export function handleProjectOwnerAdded(event: ProjectOwnerAdded): void {}

export function handleProjectOwnerRemoved(event: ProjectOwnerRemoved): void {}

export function handleProjectUpdaterAdded(event: ProjectUpdaterAdded): void {}

export function handleProjectUpdaterRemoved(
  event: ProjectUpdaterRemoved
): void {}

export function handleRemoveScoreType(event: RemoveScoreType): void {}

export function handleUnpaused(event: Unpaused): void {}

export function handleUpdateScore(event: UpdateScore): void {}

export function handleUpdateScoreFailed(event: UpdateScoreFailed): void {}
