import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { validatorConstant } from '../../constants/index';

@ValidatorConstraint({ name: 'passwordValidator', async: false })
class PasswordValidator implements ValidatorConstraintInterface {
  validate(text: string) {
    return !!text.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
  }

  defaultMessage() {
    return validatorConstant.PASSWORD_INVALID;
  }
}
export default PasswordValidator;
