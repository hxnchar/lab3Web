<script>
  import http from "./helper/request-helper";
  import { Queries } from "./helper/requests";
  import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { errorMSG, loadersCount } from "./stores.js";
  import { BarLoader } from "svelte-loading-spinners";
  let errorMessage, countLoaders, addDebtorDisabled, removeDebtorDisabled;
  errorMSG.subscribe(value => {
    errorMessage = value;
  });
  loadersCount.subscribe(value => {
    countLoaders = value;
  });
  const newDeptorInfo = {};
  function createApolloClient() {
    const wsLink = new WebSocketLink({
      uri: uri_from_env,
      options: {
        reconnect: true,
      },
    });
    const cache = new InMemoryCache();
    return new ApolloClient({
      link: wsLink,
      cache,
    });
  }

  const client = createApolloClient();
  setClient(client);

  const debtorsArray = subscribe(Queries.SUBSCRIPTION_AllDebtors);
  const AddDebtor = async () => {
    addDebtorDisabled = true;
    loadersCount.update(n => n + 1);
    const { name, surname, money } = newDeptorInfo;
    if (!name || !surname || !money) {
      addDebtorDisabled = false;
      loadersCount.update(n => n - 1);
      errorMSG.set("Surname, name and debt are required!");
      return;
    }
    try {
      await http.startExecuteMyMutation(
        Queries.InsertRecord(
          newDeptorInfo.surname,
          newDeptorInfo.name,
          newDeptorInfo.money
        )
      );
    } catch (e) {
      errorMSG.set("Error occurred: " + e.message);
      addDebtorDisabled = false;
      loadersCount.update(n => n - 1);
      return;
    }
    addDebtorDisabled = false;
    loadersCount.update(n => n - 1);
    errorMSG.set("");
  };

  const RemoveDebtors = async () => {
    removeDebtorDisabled = true;
    loadersCount.update(n => n + 1);
    try {
      await http.startExecuteMyMutation(Queries.DeleteNegative());
    } catch (e) {
      errorMSG.set("Error occurred: " + e.message);
      removeDebtorDisabled = false;
      loadersCount.update(n => n - 1);
      return;
    }
    errorMSG.set("");
    removeDebtorDisabled = false;
    loadersCount.update(n => n - 1);
  };
</script>

<main>
  {#if $debtorsArray.loading}
    <div class="overlay">
      <BarLoader size="120" color="white" unit="px" />
      <div class="overlay background" />
    </div>
  {:else if $debtorsArray.error}
    <div class="overlay">
      <h1>Error occurred :(</h1>
      <div class="overlay background" />
    </div>
  {:else if $debtorsArray.data}
    <header>Debtors list</header>
    <main>
      <table>
        <tr>
          <th>Surname</th>
          <th>Name</th>
          <th>Debt</th>
        </tr>
        {#each $debtorsArray.data.debtors as debtor (debtor.id)}
          <tr>
            <td>{debtor.surname}</td>
            <td>{debtor.name}</td>
            <td>{debtor.debt}</td>
          </tr>
        {/each}
      </table>
      <nav>
        <input bind:value={newDeptorInfo.surname} placeholder="Surname" />
        <input bind:value={newDeptorInfo.name} placeholder="Name" />
        <input bind:value={newDeptorInfo.money} placeholder="Debt" />
      </nav>
      <nav>
        <button on:click={AddDebtor} disabled={addDebtorDisabled}
          >Add debtor</button
        >
        <button on:click={RemoveDebtors} disabled={removeDebtorDisabled}
          >Delete some debtors</button
        >
      </nav>
    </main>
    <footer>
      <div class="errorLabel">{errorMessage}</div>
    </footer>
    <div
      class="overlay"
      style="visibility:{countLoaders > 0 ? 'visible' : 'hidden'}"
    >
      <BarLoader size="120" color="white" unit="px" />
      <div class="overlay background" />
    </div>
  {/if}
</main>

<style>
  :global(:root) {
    --dark-gray: #282828;
    --darkest-blue: #0c0032;
    --blue: #190061;
    --lightner-blue: #1c006e;
    --lightnest-blue: #200080;
    --light-font: #f2f2f2;
    --default-animation-time: 0.2s;
  }
  .overlay {
    width: 100vw;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 0;
  }
  .overlay.background {
    width: 100%;
    height: 100%;
    background-color: var(--darkest-blue);
    opacity: 0.3;
    z-index: -1;
  }
  .overlay:first-child {
    opacity: 1;
  }
  :global(body) {
    margin: 0;
    padding: 0;
  }
  * {
    color: var(--light-font);
  }
  main {
    margin: 0;
    padding: 0;
    min-height: 100%;
    min-width: 650px;
    background-color: var(--darkest-blue);
    z-index: -2;
  }
  table {
    width: 70%;
    margin-left: auto;
    margin-right: auto;
  }
  header {
    text-align: center;
    font-size: 4em;
    margin-bottom: 15px;
  }
  input,
  button {
    background-color: var(--blue);
    margin: 15px;
    border: 0;
  }
  button {
    cursor: pointer;
    transition-duration: var(--default-animation-time);
  }
  button:hover {
    background-color: var(--lightner-blue);
    transition-duration: var(--default-animation-time);
  }
  th,
  button,
  input {
    background-color: var(--blue);
    height: clamp(25px, 7vh, 35px);
    width: clamp(200px, 13vw, 400px);
    padding: 0;
  }
  td {
    height: clamp(50px, 15vh, 75px);
    min-width: 200px;
    padding: 0;
  }
  tr:nth-child(odd) td {
    background-color: var(--lightner-blue);
  }
  tr:nth-child(even) td {
    background-color: var(--lightnest-blue);
  }
  tr:hover {
    filter: brightness(110%);
  }
  ::placeholder {
    color: var(--light-font);
  }
  nav {
    width: 75%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }
  .errorLabel {
    margin-left: 15%;
  }
</style>
