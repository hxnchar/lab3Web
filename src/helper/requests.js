import { gql } from "@apollo/client";

export class Queries {
  static DeleteRecord = gql`
    mutation MyMutation($id: uuid!) {
      delete_debtors_by_pk(id: $id) {
        id
        surname
        name
        debt
      }
    }
  `;

  static InsertRecord = gql`
    mutation MyMutation($surname: String, $name: String, $debt: Int = "0") {
      insert_debtors_one(
        object: { surname: $surname, name: $name, debt: $debt }
      ) {
        id
        surname
        name
        debt
      }
    }
  `;

  static SUBSCRIPTION_AllDebtors = gql`
    subscription MySubscription {
      debtors {
        id
        surname
        name
        debt
      }
    }
  `;
}
