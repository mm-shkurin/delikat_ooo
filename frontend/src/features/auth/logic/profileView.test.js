import { describe, expect, it } from 'vitest'
import { profileToView } from './profileView'

describe('profileToView', () => {
  it('maps user profile fields', () => {
    expect(
      profileToView({
        user_id: 'u1',
        email: 'a@yandex.ru',
        display_name: 'Лёша',
        provider_display_name: 'Алексей',
        avatar_url: 'https://example/ava.png',
      }),
    ).toEqual({
      userId: 'u1',
      email: 'a@yandex.ru',
      displayName: 'Лёша',
      providerDisplayName: 'Алексей',
      avatarUrl: 'https://example/ava.png',
    })
  })
})
