import {NearAccount, Workspace} from 'near-workspaces-ava';

let accountsNames = [
  'peres',
  'jimenez',
  'ana',
  'maria',
  'pablo',
  'pedro',
  'jose',
  'sara',
  'sasha',
  'yoselin',
  'josefina',
  'esmeralda',
  'carolina',
]

/**
 * Initialize a new workspace. In local sandbox mode, this will:
 *
 *   - Create a new local blockchain
 *   - Create the root account for that blockchain (see `root` below)
 *   - Execute any actions passed to the function
 *   - Shut down the newly created blockchain, but *save the data*
 */
const workspace = Workspace.init(async ({root}) => {
  const admin1 = await root.createAccount('sebastian')
  const admin2 = await root.createAccount('dario')
  const contract = await root.createAndDeploy(
    'status-message',
    '../contract/out/marketplace.wasm',

    // Provide `method` and `args` to call in the same transaction as the deploy
    // {
    //   method: 'init',
    //   args: {owner_id: root},
    // },
  );

  // Return the accounts that you want available in subsequent tests
  // (`root` is always available)
  return {admin1, admin2, contract};
});

// workspace.test('statuses initialized in Workspace.init', async (test, {alice, contract, root}) => {
//   // If you want to store a `view` in a local variable, you can inform
//   // TypeScript what sort of return value you expect.
//   const aliceStatus: string = await contract.view('get_status', {account_id: alice});
//   const rootStatus: null = await contract.view('get_status', {account_id: root});

//   test.is(aliceStatus, 'hello');

//   // Note that the test above sets a status for `root`, but here it's still
//   // null! This is because tests run concurrently in isolated environments.
//   test.is(rootStatus, null);
// });

workspace.test('extra goodies', async (test, {admin1, admin2, contract, root}) => {
  /**
   * Try it out using `npm run test -- --verbose` (with yarn: `yarn test --verbose`),
   */

  let accounts = Array<NearAccount>();

  for (let index = 0; index < accountsNames.length; index++) {
    accounts.push(await root.createAccount(accountsNames[index]))
    
  }

  test.log({
    accounts: accounts,
  });

  /**
   * The Account class from near-workspaces overrides `toJSON` so that removing
   * `.accountId` from the lines above gives the same behavior.
   * (This explains something about the example `contract.view` calls above:
   * you may have noticed that they use things like `{account_id: root}`
   * instead of `{account_id: root.accountId}`.)
   * Here's a test to prove it; try updating the `test.log` above to see it.
   */
  test.is(
    true,
    true,
  );
});

// For more example tests, see:
// https://github.com/near/workspaces-js/tree/main/__tests__
