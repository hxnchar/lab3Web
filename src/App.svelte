<script>
  import http from "./helper/request-helper";
  import { Queries } from "./helper/requests";
  import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { errorMSG, loadersCount } from "./stores.js";
  import { Jumper } from "svelte-loading-spinners";
  import { get } from "svelte/store";

  let errorMessage, countLoaders, addDebtorDisabled, removeDebtorDisabled;
  const newDeptorInfo = {};
  errorMSG.subscribe(value => {
    errorMessage = value;
  });
  loadersCount.subscribe(value => {
    countLoaders = value;
  });
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

  const debtorsArray = subscribe(Queries.SUBSCRIPTION_AllTodos);

  const AddDebtor = async () => {
    addDebtorDisabled = true;
    loadersCount.update(n => n + 1);
    const { name, surname, money } = newDeptorInfo;
    if (!name || !surname || !money) {
      addDebtorDisabled = false;
      loadersCount.update(n => n - 1);
      errorMSG.set("Введіть ім'я, прізвище та борг");
      return;
    }
    try {
      await http.startExecuteMyMutation(
        Queries.InsertRecord(
          newDeptorInfo.name,
          newDeptorInfo.surname,
          newDeptorInfo.money
        )
      );
      addDebtorDisabled = false;
      loadersCount.update(n => n - 1);
    } catch {
      errorMSG.set("Помилка");
      addDebtorDisabled = false;
      loadersCount.update(n => n - 1);
      return;
    }
    errorMSG.set("");
  };

  const RemoveDebtors = async () => {
    removeDebtorDisabled = true;
    loadersCount.update(n => n + 1);
    try {
      await http.startExecuteMyMutation(Queries.DeleteNegative());
    } catch {
      errorMSG.set("Помилка");
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
    <div>loading ...</div>
    <Jumper size="60" color="#FF3E00" unit="px" />
  {:else if $debtorsArray.error}
    <div>Error!</div>
  {:else if $debtorsArray.data}
    <input bind:value={newDeptorInfo.name} />
    <input bind:value={newDeptorInfo.surname} />
    <input bind:value={newDeptorInfo.money} />
    <button on:click={AddDebtor} disabled={addDebtorDisabled}
      >Add debtor😈</button
    >
    <button on:click={RemoveDebtors} disabled={removeDebtorDisabled}
      >Delete some debtors =)</button
    >
    <table border="1">
      <caption>Debtors</caption>
      <tr>
        <th>Surname</th>
        <th>Name</th>
        <th>Debt</th>
      </tr>
      {#each $debtorsArray.data.debtors as debtor}
        <tr>
          <td>{debtor.surname}</td>
          <td>{debtor.name}</td>
          <td>{debtor.debt}</td>
        </tr>
      {/each}
    </table>
    <p>{errorMessage}</p>
    {#if get(loadersCount) > 0}
      <Jumper size="60" color="#FF3E00" unit="px" />
      <Jumper size="60" color="#FF3E00" unit="px" />
      <Jumper size="60" color="#FF3E00" unit="px" />
    {/if}
  {/if}
</main>

<style>
  main {
    padding: 0;
    margin: 0;
  }
</style>
