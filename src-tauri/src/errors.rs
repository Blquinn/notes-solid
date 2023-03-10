use serde::{ser::Serializer, Serialize};


// create the error type that represents all errors possible in our program
#[derive(Debug, thiserror::Error)]
pub enum CommandError {
    #[error(transparent)]
    //   RusqliteError(#[from] rusqlite::Error),
    AnyhowError(#[from] anyhow::Error),
}

// we must manually implement serde::Serialize
impl Serialize for CommandError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

// impl From<anyhow::Error> for CommandError {
//     fn from(value: anyhow::Error) -> Self {
//         CommandError::AnyhowError(value)
//     }
// }

pub type CommandResult<T, E = CommandError> = anyhow::Result<T, E>;
