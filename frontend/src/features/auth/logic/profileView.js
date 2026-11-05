export function profileToView(profile) {
  return {
    userId: profile.user_id,
    email: profile.email,
    displayName: profile.display_name,
    providerDisplayName: profile.provider_display_name,
    avatarUrl: profile.avatar_url ?? null,
  }
}
