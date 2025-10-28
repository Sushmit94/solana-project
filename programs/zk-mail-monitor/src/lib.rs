#![allow(unexpected_cfgs)] // silences harmless macro warnings

use anchor_lang::prelude::*;
use borsh::BorshDeserialize;

declare_id!("G9DrkqHZj8LwKdTMtCwP9tdLBLf8ZegkwDWUA47wvZzQ");

#[program]
pub mod zk_mail_monitor {
    use super::*;

    /// Submit a zero-knowledge proof and record it on-chain.
    ///
    /// # Arguments
    /// * `proof` - The proof data as bytes (for now, just stored raw)
    /// * `event_type` - A small integer categorizing the event (e.g., 1 = email verified)
    pub fn submit_proof(
        ctx: Context<SubmitProof>,
        proof: Vec<u8>,
        event_type: u8,
    ) -> Result<()> {
        let record = &mut ctx.accounts.record;
        record.proof = proof;
        record.event_type = event_type;
        record.timestamp = Clock::get()?.unix_timestamp;

        msg!("✅ Proof submitted by {}", ctx.accounts.user.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    /// PDA account to store the proof record.
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 4 + 512 + 1 + 8, // discriminator + vec length + proof bytes + event_type + timestamp
        seeds = [b"proof", user.key().as_ref()],
        bump
    )]
    pub record: Account<'info, ProofRecord>,

    /// The signer submitting the proof.
    #[account(mut)]
    pub user: Signer<'info>,

    /// System program for account creation.
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ProofRecord {
    /// Serialized proof bytes (truncated if needed)
    pub proof: Vec<u8>,

    /// Type of event (application-defined)
    pub event_type: u8,

    /// Unix timestamp of submission
    pub timestamp: i64,
}
