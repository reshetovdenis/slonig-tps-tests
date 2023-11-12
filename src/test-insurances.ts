// An example TypeScript script to use a recommendation letter pallet from a blockchain
// Run an example blockchain first: https://github.com/slonigiraf/recommendation-letter-example-node

import { ApiPromise, Keyring } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';
import { sign, getPublicDataToSignByReferee, getDataToSignByWorker } from './helpers';

async function main(): Promise<void> {
  const insurance_id: number = 0;
  const amount: number = 0;
  console.log("insurance_id: ", insurance_id);
  console.log("amount: ", amount);

  const api: ApiPromise = await ApiPromise.create();
  const keyring: Keyring = new Keyring({ type: 'sr25519' });
  const referee = keyring.addFromUri('//Alice');
  const worker = keyring.addFromUri('//Bob');
  const employer = keyring.addFromUri('//Bob//stash');

  const refereeU8: Uint8Array = referee.publicKey;
  const refereeHex: string = u8aToHex(referee.publicKey);
  console.log("refereeU8: ", refereeU8);
  console.log("refereeHex: ", refereeHex);

  const workerU8: Uint8Array = worker.publicKey;
  const workerHex: string = u8aToHex(worker.publicKey);
  console.log("workerU8: ", workerU8);
  console.log("workerHex: ", workerHex);

  const employerU8: Uint8Array = employer.publicKey;
  const employerHex: string = u8aToHex(employer.publicKey);
  console.log("employerU8: ", employerU8);
  console.log("employerHex: ", employerHex);
  
  const dataToBeSignedByReferee: Uint8Array = getPublicDataToSignByReferee(insurance_id, refereeU8, workerU8, amount);
  console.log("dataToBeSignedByReferee: ", dataToBeSignedByReferee);

  const refereeSignatureU8: Uint8Array = sign(referee, dataToBeSignedByReferee);
  const refereeSignatureHex: string = u8aToHex(refereeSignatureU8);
  console.log("refereeSignatureU8: ", refereeSignatureU8);
  console.log("refereeSignatureHex: ", refereeSignatureHex);

  const dataToSignByWorker: Uint8Array = getDataToSignByWorker(insurance_id, refereeU8, workerU8, amount, refereeSignatureU8, employerU8);
  const workerSignatureU8: Uint8Array = sign(worker, dataToSignByWorker);
  const workerSignatureHex: string = u8aToHex(workerSignatureU8);
  console.log("workerSignatureU8: ", workerSignatureU8);
  console.log("workerSignatureHex: ", workerSignatureHex);

  // Create a transaction
  const reimburse = api.tx.insurances.reimburse(insurance_id,
    refereeHex,
    workerHex,
    employerHex,
    amount,
    refereeSignatureHex,
    workerSignatureHex);

  // Sign and send the transaction using our account
  const hash = await reimburse.signAndSend(employer);
  console.log('Transfer sent with hash', hash.toHex());
}

main().catch(console.error).finally(() => process.exit());
