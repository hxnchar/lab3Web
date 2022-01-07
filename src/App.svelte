<script>
  import http from "./helper/request-helper";
  import { Queries } from "./helper/requests";
  import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { errorMSG } from "./stores.js";
  let errorMessage;
  errorMSG.subscribe(value => {
    errorMessage = value;
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
  const newDeptorInfo = {};
  const AddDebtor = async () => {
    let newDebtorArr = [];
    newDebtorArr = document
      .getElementById("newDebtorInputbox")
      .value.split(" ");
    if (
      newDebtorArr.length != 3 ||
      newDebtorArr[0] == "" ||
      newDebtorArr[1] == ""
    ) {
      errorMSG.update(n => (n = "Введіть ім'я, прізвище та борг"));
      return;
    }
    try {
      await http.startExecuteMyMutation(
        Queries.InsertRecord(newDebtorArr[0], newDebtorArr[1], newDebtorArr[2])
      );
    } catch {
      errorMSG.update(n => (n = "Помилка"));
      return;
    }
    errorMSG.update(n => (n = ""));
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
  {:else if $debtorsArray.error}
    <div>Error!</div>
  {:else if $debtorsArray.data}
    <input bind:value={newDeptorInfo.name} />
    <input bind:value={newDeptorInfo.surname} />
    <input bind:value={newDeptorInfo.money} />
    <button on:click={AddDebtor}>Add debtor😈</button>
    <button on:click={RemoveDebtors}>Delete some debtors =)</button>
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
  {/if}
</main>

<style>
  main {
    padding: 0;
    margin: 0;
  }
</style>
