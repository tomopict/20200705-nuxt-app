import { mount } from '@vue/test-utils'
import BaseButton from '@/src/components/atoms/baseButton.vue'

describe('baseButton', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(BaseButton)
    expect(wrapper.vm).toBeTruthy()
  })
})
