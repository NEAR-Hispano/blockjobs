import {BN, Gas, NEAR, NearAccount, Workspace} from 'near-workspaces-ava';

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
  const marketplace = await root.createAndDeploy(
    'marketplace',
    '../contract/out/marketplace.wasm',

    // Provide `method` and `args` to call in the same transaction as the deploy
    // {
    //   method: 'init',
    //   args: {owner_id: root},
    // },
  );
  const mediator = await root.createAndDeploy(
    'mediator',
    '../contract/out/mediator.wasm',

    // Provide `method` and `args` to call in the same transaction as the deploy
    // {
    //   method: 'init',
    //   args: {owner_id: root},
    // },
  );
  const ft = await root.createAndDeploy(
    'ft',
    '../contract/out/ft.wasm',

    // Provide `method` and `args` to call in the same transaction as the deploy
    // {
    //   method: 'init',
    //   args: {owner_id: root},
    // },
  );

  // Return the accounts that you want available in subsequent tests
  // (`root` is always available)
  return {admin1, admin2, marketplace, mediator, ft};
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

workspace.test('extra goodies', async (test, {admin1, admin2, marketplace, mediator, ft, root}) => {
  /**
   * Try it out using `npm run test -- --verbose` (with yarn: `yarn test --verbose`),
   */

  let accounts = Array<NearAccount>();

  for (let index = 0; index < accountsNames.length; index++) {
    accounts.push(await root.createAccount(accountsNames[index]))
  }

  await marketplace.call(marketplace, 'new', {
      owner_id: marketplace.accountId,
      mediator: mediator.accountId,
      ft: ft.accountId
    },
    {
      attachedDeposit: NEAR.parse('1')
    }
  );

  let userAdmin1 = await admin1.call(marketplace, 'add_user', {
      'roles': ["Professional"],
      "categories": "hola"
    },
    {
      attachedDeposit: NEAR.parse('1')
    }
  );
  userAdmin1 = await marketplace.call(marketplace, 'set_user_role', {
      account_id: admin1.accountId,
      role: "Admin",
      remove: false
    }
  );

  let userAdmin2 = await admin2.call(marketplace, 'add_user', {
      'roles': ["Professional"],
      "categories": "hola"
    },
    {
      attachedDeposit: NEAR.parse('1')
    }
  );
  userAdmin2 = await marketplace.call(marketplace, 'set_user_role', {
      account_id: admin2.accountId,
      role: "Admin",
      remove: false
    }
  );
  
  let userAdmin1Services: any = await admin1.call(marketplace, 'mint_service', {
      metadata: {
        title: "Desarrollo web",
        description: "Trabajo part-time con React",
        icon: "foto.png",
        price: 1
      },
      quantity: 3,
      duration: 30
    },
    {
      attachedDeposit: NEAR.parse('1')
    }
  );

  await admin2.call(marketplace, 'buy_service', {
      service_id: userAdmin1Services.id
    },
    {
      attachedDeposit: NEAR.parse('10'),
      gas: Gas.parse('300Tgas')
    }
  )

  let boughtServices: any = await marketplace.view('get_service_by_id', {
      service_id: 0
    }
  )

  test.log({
    user1: userAdmin1,
    user2: userAdmin2,
    servicios_de_user1: userAdmin1Services,
    boughtServices: boughtServices
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
    boughtServices.actual_owner,
    admin2.accountId,
  );
  test.is(
    boughtServices.creator_id,
    admin1.accountId,
  );
  test.is(
    boughtServices.on_sale,
    false,
  );
  test.is(
    boughtServices.sold,
    true,
  );
  test.is(
    boughtServices.metadata,
    userAdmin1Services.metadata,
  );
});

// For more example tests, see:
// https://github.com/near/workspaces-js/tree/main/__tests__
