import { FormControl, InputLabel } from '@material-ui/core'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { changeForm } from '../actions/appActions'
import { Input } from '@material-ui/core'

export default function MyInput({ id, className, type, name, model, placeholder, autofocus, ...props }) {
  const authForm = useSelector(state => state.changeForm)
  const dispatch = useDispatch()

  const onChangeInput = useCallback(
    ({ target: { name, value } }) => {
      // temp workaround
      if (name.includes("password")) {
        name = "password"
      }
      dispatch(changeForm({ [name]: value }))
    },
    [],
  )

  return (
    <FormControl className={`InputBox ${className || ""}`}>
      {/* <InputLabel htmlFor={id}>{placeholder}</InputLabel> */}
      <Input id={id} className="InputBox_input" type={type} name={name}
        value={authForm[model]} autoCapitalize='none' required placeholder={placeholder}
        onChange={onChangeInput} autoFocus={autofocus ? true : false} color="secondary" {...props}>
      </Input>
    </FormControl>
  )
}
