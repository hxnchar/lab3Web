<script>
	import http from "./helper/request-helper";
	import {Queries} from "./helper/requests";
	import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
	import { setClient, subscribe } from "svelte-apollo";
	import { WebSocketLink } from "@apollo/client/link/ws";

	function createApolloClient() {
	const wsLink = new WebSocketLink({
		uri: "wss://labbbb3.herokuapp.com/v1/graphql",
		options: {
			reconnect: true,
		},
	});
	const cache = new InMemoryCache();
	const client = new ApolloClient({
		link: wsLink,
		cache,
	});
	return client;
	}

	const client = createApolloClient();
	setClient(client);

	const debtorsArray = subscribe(Queries.SUBSCRIPTION_AllTodos);

	const AddDebtor = async () => {
		let newDebtorArr = []
		newDebtorArr = document.getElementById("newDebtorInputbox").value.split(' ');
		if (newDebtorArr[0] == "" || newDebtorArr[1] == "")
			return
		await http.startExecuteMyMutation(Queries.InsertRecord(newDebtorArr[0], newDebtorArr[1], newDebtorArr[2]));
	}

	const RemoveDebtors = async () => {
		await http.startExecuteMyMutation(Queries.DeleteNegative());
	}
</script>

<main>
	{#if $debtorsArray.loading}
	<div>loading ...</div>
	{:else if $debtorsArray.error}
	<div>Error!</div>
	{:else if $debtorsArray.data}
	<input id = "newDebtorInputbox">
	<button on:click={AddDebtor}>Add debtor😈</button>
	<button on:click={RemoveDebtors}>Delete some debtors =)</button>
	<table border = 1><caption>Debtors</caption>
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
	{/if}
	
</main>

<style>
	
</style>