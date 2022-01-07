import { gql } from "@apollo/client";

export class Queries {
  static AllRecords = () => `
    query MyQuery {
      debtors {
        id
        surname
        name
        debt
      }
    }
  `;

  static InsertRecord = (surname, name, debt) => `
    mutation MyMutation {
        insert_debtors(objects: {surname: "${surname}", name: "${name}", debt: ${debt}}) {
        returning {
            id
            surname
            name
            debt
        }
        }
    }
    `;

  static DeleteNegative = () => `
    mutation MyMutation {
      delete_debtors(where: {debt: {_lte: 0}}) {
        returning {
          surname
          name
          debt
        }
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
